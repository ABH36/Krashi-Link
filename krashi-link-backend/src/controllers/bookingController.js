const Booking = require('../models/Booking');
const Machine = require('../models/Machine');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const OTPService = require('../services/otpService');
const sendNotification = require('../utils/notificationHelper');
const { ERROR_CODES } = require('../config/constants');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 👇 MASTER FORMULA (Billing Logic)
const calculateBilling = (scheme, rate, durationMinutes, areaBigha) => {
  let amount = 0;
  
  // Ensure duration is rounded UP to nearest minute
  const roundedMinutes = Math.ceil(durationMinutes);

  if (scheme === 'area') {
    amount = rate * (areaBigha || 1);
  } else if (scheme === 'hourly' || scheme === 'time') {
    const ratePerMinute = rate / 60;
    amount = roundedMinutes * ratePerMinute;
  } else if (scheme === 'daily') {
    const days = Math.ceil(roundedMinutes / (60 * 24));
    amount = rate * days;
  }

  return Math.max(10, Math.ceil(amount));
};

exports.debugUser = async (req, res) => res.json({ success: true, data: { userId: req.user.id } });

// 1. Get Owner Bookings
exports.getOwnerBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const machines = await Machine.find({ ownerId: req.user.id });
    
    const bookings = await Booking.find({ machineId: { $in: machines.map(m => m._id) } })
      .populate('machineId farmerId')
      .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    
    // ✅ SECURITY FIX: Hide Arrival OTP from Owner list
    // Owner ko list mein OTP dikhne ki jarurat nahi hai, Farmer batayega
    const sanitizedBookings = bookings.map(b => {
        const obj = b.toObject();
        if (obj.otp) delete obj.otp.arrivalOTP; 
        return obj;
    });
    
    const total = await Booking.countDocuments({ machineId: { $in: machines.map(m => m._id) } });
    res.json({ success: true, data: { bookings: sanitizedBookings, pagination: { total } } });
  } catch (e) { res.status(500).json({ success: false }); }
};

// 2. Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { machineId, requestedStartAt, billingScheme, areaBigha } = req.body;
    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ success: false });

    const booking = await Booking.create({
      farmerId: req.user.id,
      ownerId: machine.ownerId,
      machineId,
      schedule: { requestedStartAt },
      billing: { scheme: billingScheme, rate: machine.pricing.rate, unit: machine.pricing.unit, areaBigha },
      socketRoom: `booking_${Date.now()}`
    });

    const io = req.app.get('io');
    io.to(machine.ownerId.toString()).emit('booking_request', { bookingId: booking._id });
    sendNotification(io, machine.ownerId, 'New Booking', `Farmer requested ${machine.name}`, 'info');

    res.json({ success: true, data: { bookingId: booking._id } });
  } catch (e) { res.status(500).json({ success: false }); }
};

// 3. Confirm Booking
exports.confirmBooking = async (req, res) => {
  try {
    const { accept, arrivalDeadlineMinutes } = req.body;
    const booking = await Booking.findById(req.params.id);
    const io = req.app.get('io');
    
    if (accept) {
        const arrivalOTP = generateOTP();
        console.log(`🚜 ARRIVAL OTP: ${arrivalOTP}`);
        booking.status = 'owner_confirmed';
        booking.schedule.arrivalDeadlineAt = new Date(Date.now() + (arrivalDeadlineMinutes || 60) * 60000);
        booking.otp = { arrivalOTP, expiresAt: new Date(Date.now() + 30*60000) };
        await booking.save();
        OTPService.storeOTP(booking._id, 'arrival', arrivalOTP);
        
        // ✅ Send OTP ONLY to Farmer via Socket
        io.to(booking.farmerId.toString()).emit('booking_confirmed', { bookingId: booking._id, arrivalOTP });
        sendNotification(io, booking.farmerId, 'Booking Confirmed', 'Owner accepted. Share OTP to start.', 'success');
    } else {
        booking.status = 'cancelled';
        await booking.save();
        io.to(booking.farmerId.toString()).emit('booking_rejected', { bookingId: booking._id });
        sendNotification(io, booking.farmerId, 'Booking Rejected', 'Owner rejected request', 'error');
    }
    // Response mein OTP nahi bhej rahe owner ko
    res.json({ success: true, data: { status: booking.status } });
  } catch (e) { res.status(500).json({ success: false }); }
};

// 4. Verify Arrival (Start Work)
exports.verifyArrival = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    const otpResult = OTPService.verifyOTP(booking._id, 'arrival', req.body.otp);
    if (!otpResult.valid) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    booking.status = 'arrived_otp_verified';
    booking.timer = { startedAt: new Date() };
    await booking.save();

    const completionOTP = generateOTP();
    OTPService.storeOTP(booking._id, 'completion', completionOTP);
    booking.otp.completionOTP = completionOTP;
    await booking.save();
    console.log(`✅ COMPLETION OTP: ${completionOTP}`);

    const eventData = { bookingId: booking._id, startedAt: booking.timer.startedAt };
    const io = req.app.get('io');
    
    // Farmer gets timer start event
    io.to(booking.farmerId.toString()).emit('timer_started', eventData);
    
    // ✅ Owner gets timer start AND Completion OTP (to stop later)
    io.to(booking.ownerId.toString()).emit('timer_started', { ...eventData, completionOTP });
    sendNotification(io, booking.farmerId, 'Work Started', 'Timer has started', 'info');

    // Send Completion OTP in response so Owner sees it immediately
    res.json({ 
        success: true, 
        data: { 
            status: booking.status, 
            timer: booking.timer,
            otp: { completionOTP } 
        } 
    });
  } catch (e) { res.status(500).json({ success: false }); }
};

// 5. Verify Completion (End Work)
exports.verifyCompletion = async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);

    // ✅ Only Farmer can verify completion (enter OTP provided by Owner)
    if (booking.farmerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    const otpResult = OTPService.verifyOTP(booking._id, 'completion', otp);
    if (!otpResult.valid) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    const stoppedAt = new Date();
    const durationMs = stoppedAt - new Date(booking.timer.startedAt);
    const rawMinutes = durationMs / 60000;
    const durationMinutes = Math.max(1, rawMinutes);

    const calculatedAmount = calculateBilling(
        booking.billing.scheme, 
        booking.billing.rate, 
        durationMinutes, 
        booking.billing.areaBigha
    );

    const displayMinutes = Math.ceil(durationMinutes);

    booking.status = 'completed_pending_payment';
    booking.timer.stoppedAt = stoppedAt;
    booking.timer.durationMinutes = displayMinutes;
    booking.billing.calculatedAmount = calculatedAmount;
    booking.billing.durationMinutes = displayMinutes;
    await booking.save();

    console.log(`💰 Bill: ₹${calculatedAmount} (${displayMinutes} mins)`);

    const io = req.app.get('io');
    const eventData = { bookingId: booking._id, calculatedAmount };
    io.to(booking.ownerId.toString()).emit('timer_stopped', eventData);
    io.to(booking.farmerId.toString()).emit('timer_stopped', eventData);

    sendNotification(io, booking.ownerId, 'Work Completed', `Bill: ₹${calculatedAmount}`, 'success');
    sendNotification(io, booking.farmerId, 'Work Completed', 'Please pay now', 'info');

    res.json({ success: true, data: { status: booking.status, billing: booking.billing } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.resendOTP = async (req, res) => {
    try {
        const newOTP = generateOTP();
        OTPService.storeOTP(req.params.id, req.body.type, newOTP);
        
        const booking = await Booking.findById(req.params.id);
        if (req.body.type === 'completion') booking.otp.completionOTP = newOTP;
        if (req.body.type === 'arrival') booking.otp.arrivalOTP = newOTP;
        await booking.save();

        res.json({ success: true, message: 'Resent', data: { otp: newOTP } });
    } catch (e) { res.status(500).json({ success: false }); }
};

exports.getUserBookings = async (req, res) => {
    const query = req.user.role === 'farmer' ? { farmerId: req.user.id } : { ownerId: req.user.id };
    const bookings = await Booking.find(query).populate('machineId ownerId farmerId').sort({ createdAt: -1 });
    res.json({ success: true, data: { bookings } });
};

// 👇 CRITICAL: Safe Get Booking By ID
exports.getBookingById = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('machineId ownerId farmerId');
    if (!booking) return res.status(404).json({ success: false });
    
    const uid = req.user.id.toString();
    if(booking.farmerId._id.toString() !== uid && booking.ownerId._id.toString() !== uid && req.user.role !== 'admin') {
        return res.status(403).json({ success: false });
    }

    // ✅ FIX: SECURITY SANITIZATION (OTP Swap Logic)
    let safeBooking = booking.toObject();

    if (req.user.role === 'farmer') {
        // Farmer sees Arrival OTP (to start job)
        // Farmer does NOT see Completion OTP (Owner has it)
        if (safeBooking.otp) delete safeBooking.otp.completionOTP;
    } 
    else if (req.user.role === 'owner') {
        // Owner does NOT see Arrival OTP (Farmer has it)
        // Owner sees Completion OTP (to stop job)
        if (safeBooking.otp) delete safeBooking.otp.arrivalOTP;
    }

    res.json({ success: true, data: { booking: safeBooking } });
};

exports.cancelBooking = async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ success: true });
};

exports.createDispute = async (req, res) => { res.json({ success: true }); };