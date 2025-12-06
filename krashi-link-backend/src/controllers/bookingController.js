const Booking = require('../models/Booking');
const Machine = require('../models/Machine');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const OTPService = require('../services/otpService');
const sendNotification = require('../utils/notificationHelper');
const { ERROR_CODES } = require('../config/constants');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 👇 MASTER FORMULA (Isi ko Frontend match karega)
const calculateBilling = (scheme, rate, durationMinutes, areaBigha) => {
  let amount = 0;
  
  // Ensure duration is rounded UP to nearest minute (1.1 min = 2 min)
  const roundedMinutes = Math.ceil(durationMinutes);

  if (scheme === 'area') {
    amount = rate * (areaBigha || 1);
  } else if (scheme === 'hourly' || scheme === 'time') {
    // Rate is Per Hour. Calculate Per Minute rate.
    const ratePerMinute = rate / 60;
    amount = roundedMinutes * ratePerMinute;
  } else if (scheme === 'daily') {
    // Daily rate logic (Minimum 1 day)
    const days = Math.ceil(roundedMinutes / (60 * 24));
    amount = rate * days;
  }

  // Round final amount to nearest integer and enforce Minimum ₹10
  return Math.max(10, Math.ceil(amount));
};

const getOTPErrorMessage = (reason) => 'OTP verification failed';

exports.debugUser = async (req, res) => res.json({ success: true, data: { userId: req.user.id } });

exports.getOwnerBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const machines = await Machine.find({ ownerId: req.user.id });
    const bookings = await Booking.find({ machineId: { $in: machines.map(m => m._id) } })
      .populate('machineId farmerId')
      .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    
    const total = await Booking.countDocuments({ machineId: { $in: machines.map(m => m._id) } });
    res.json({ success: true, data: { bookings, pagination: { total } } });
  } catch (e) { res.status(500).json({ success: false }); }
};

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
        
        io.to(booking.farmerId.toString()).emit('booking_confirmed', { bookingId: booking._id });
        sendNotification(io, booking.farmerId, 'Booking Confirmed', 'Owner accepted request', 'success');
    } else {
        booking.status = 'cancelled';
        await booking.save();
        io.to(booking.farmerId.toString()).emit('booking_rejected', { bookingId: booking._id });
        sendNotification(io, booking.farmerId, 'Booking Rejected', 'Owner rejected request', 'error');
    }
    res.json({ success: true, data: { status: booking.status } });
  } catch (e) { res.status(500).json({ success: false }); }
};

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
    io.to(booking.farmerId.toString()).emit('timer_started', eventData);
    io.to(booking.ownerId.toString()).emit('timer_started', eventData);
    sendNotification(io, booking.farmerId, 'Work Started', 'Timer has started', 'info');

    res.json({ success: true, data: { status: booking.status, timer: booking.timer } });
  } catch (e) { res.status(500).json({ success: false }); }
};

// 👇 VERIFY COMPLETION with Strict Math
exports.verifyCompletion = async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking.farmerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    const otpResult = OTPService.verifyOTP(booking._id, 'completion', otp);
    if (!otpResult.valid) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    const stoppedAt = new Date();
    const durationMs = stoppedAt - new Date(booking.timer.startedAt);
    
    // Step 1: Calculate Minutes (Round UP) - Example 61sec = 2min
    // Use floating point first for exactness
    const rawMinutes = durationMs / 60000;
    // Ensure at least 1 minute is charged if started
    const durationMinutes = Math.max(1, rawMinutes);

    // Step 2: Calculate Bill using Master Formula
    const calculatedAmount = calculateBilling(
        booking.billing.scheme, 
        booking.billing.rate, 
        durationMinutes, 
        booking.billing.areaBigha
    );

    // Save rounded minutes for display
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
        console.log(`🔄 RESENT OTP: ${newOTP}`);
        if (req.body.type === 'completion') {
             const b = await Booking.findById(req.params.id);
             b.otp.completionOTP = newOTP;
             await b.save();
        }
        res.json({ success: true, message: 'Resent' });
    } catch (e) { res.status(500).json({ success: false }); }
};

exports.getUserBookings = async (req, res) => {
    const query = req.user.role === 'farmer' ? { farmerId: req.user.id } : { ownerId: req.user.id };
    const bookings = await Booking.find(query).populate('machineId ownerId farmerId').sort({ createdAt: -1 });
    res.json({ success: true, data: { bookings } });
};

exports.getBookingById = async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('machineId ownerId farmerId');
    if (!booking) return res.status(404).json({ success: false });
    const uid = req.user.id.toString();
    if(booking.farmerId._id.toString() !== uid && booking.ownerId._id.toString() !== uid && req.user.role !== 'admin') {
        return res.status(403).json({ success: false });
    }
    res.json({ success: true, data: { booking } });
};

exports.cancelBooking = async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ success: true });
};

exports.createDispute = async (req, res) => { res.json({ success: true }); };