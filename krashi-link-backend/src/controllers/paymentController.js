const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendNotification = require('../utils/notificationHelper'); // ✅ Added back

// Helper: Check Mode
const isMockMode = () => {
    return process.env.PAYMENT_MODE === 'MOCK' || !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('test_xxxx');
};

// Init Razorpay safely
let razorpay = null;
if (!isMockMode()) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } catch (e) { console.log("Razorpay Init Failed"); }
}

// 1. Initiate Payment
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // --- MOCK MODE ---
    if (isMockMode()) {
        return res.json({
            success: true,
            data: {
                isMock: true,
                orderId: `mock_order_${Date.now()}`,
                amount: amount * 100,
                currency: 'INR',
                key: 'mock_key'
            }
        });
    }

    // --- REAL MODE ---
    const options = {
        amount: amount * 100,
        currency: 'INR',
        receipt: `bk_${bookingId.slice(-10)}`,
        payment_capture: 1
    };
    const order = await razorpay.orders.create(options);

    await Transaction.create({
        bookingId: booking._id,
        farmerId: booking.farmerId,
        ownerId: booking.ownerId,
        type: 'payment',
        amount: amount,
        status: 'pending',
        gateway: 'razorpay',
        gatewayOrderId: order.id
    });

    res.json({
        success: true,
        data: {
            isMock: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        }
    });

  } catch (error) {
    console.error("Init Error:", error);
    res.status(500).json({ success: false, message: 'Initiation Failed' });
  }
};

// 2. Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock, bookingId } = req.body;
    const io = req.app.get('io'); // ✅ Get Socket IO

    // --- MOCK VERIFICATION ---
    if (isMock || isMockMode()) {
        console.log("⚠️ MOCK VERIFYING...");
        
        const targetBookingId = bookingId || req.body.bookingId;
        const booking = await Booking.findById(targetBookingId).populate('farmerId ownerId'); 
        
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const transaction = await Transaction.create({
            bookingId: booking._id,
            farmerId: booking.farmerId._id,
            ownerId: booking.ownerId._id,
            type: 'payment',
            amount: booking.billing.calculatedAmount,
            status: 'completed',
            gateway: 'mock_gateway',
            gatewayPaymentId: `pay_mock_${Date.now()}`
        });

        await finalizePayment(booking, transaction._id);

        // ✅ NOTIFICATIONS ADDED BACK
        sendNotification(io, booking.farmerId._id, 'Payment Successful', `You paid ₹${booking.billing.calculatedAmount}`, 'success');
        sendNotification(io, booking.ownerId._id, 'Payment Received', `Received ₹${booking.billing.calculatedAmount} for booking`, 'success');

        return res.json({ success: true, message: 'Mock Payment Success' });
    }

    // --- REAL VERIFICATION ---
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid Signature' });
    }

    const transaction = await Transaction.findOne({ gatewayOrderId: razorpay_order_id });
    if (!transaction) return res.status(404).json({ success: false, message: 'Txn Not Found' });

    transaction.status = 'completed';
    transaction.gatewayPaymentId = razorpay_payment_id;
    await transaction.save();

    const booking = await Booking.findById(transaction.bookingId).populate('farmerId ownerId');
    await finalizePayment(booking, transaction._id);

    // ✅ NOTIFICATIONS ADDED BACK (Real Mode)
    sendNotification(io, booking.farmerId._id, 'Payment Successful', `₹${booking.billing.calculatedAmount} paid via Razorpay`, 'success');
    sendNotification(io, booking.ownerId._id, 'Payment Received', `Received ₹${booking.billing.calculatedAmount}`, 'success');

    res.json({ success: true, message: 'Verified' });

  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ success: false, message: 'Verification Failed' });
  }
};

// Helper Function
async function finalizePayment(booking, transactionId) {
    booking.status = 'paid';
    booking.payment = { transactionId, status: 'paid', paidAt: new Date() };
    booking.billing.paidAmount = booking.billing.calculatedAmount;
    await booking.save();

    await User.findByIdAndUpdate(booking.ownerId._id || booking.ownerId, { $inc: { trustScore: 2 } });
    await User.findByIdAndUpdate(booking.farmerId._id || booking.farmerId, { $inc: { trustScore: 1 } });
    
    await Transaction.create({
        bookingId: booking._id,
        farmerId: booking.farmerId._id || booking.farmerId,
        ownerId: booking.ownerId._id || booking.ownerId,
        type: 'release',
        amount: booking.billing.calculatedAmount,
        status: 'released',
        gateway: 'system',
        audit: { notes: 'Auto Payout' }
    });
}

// 3. Get User Transactions with Total Earnings
exports.getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = req.user.role === 'farmer' ? { farmerId: userId } : { ownerId: userId };
        
        const transactions = await Transaction.find(query).populate('bookingId').sort({ createdAt: -1 });
        
        // ✅ TOTAL EARNINGS AGGREGATION
        const aggregation = await Transaction.aggregate([
            { 
                $match: { 
                    ...query, 
                    type: 'payment', 
                    status: 'completed' 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: '$amount' } 
                } 
            }
        ]);

        const totalEarnings = aggregation.length > 0 ? aggregation[0].total : 0;

        res.json({ 
            success: true, 
            data: { 
                transactions,
                stats: { totalEarnings } 
            } 
        });

    } catch (e) { 
        console.error(e);
        res.status(500).json({ success: false }); 
    }
};

exports.verifyPaymentAdmin = async (req, res) => { res.json({ success: true }); };
exports.releasePayout = async (req, res) => { res.json({ success: true }); };
exports.refundPayment = async (req, res) => { res.json({ success: true }); };
exports.simulateSuccess = async (req, res) => { res.json({ success: true }); };