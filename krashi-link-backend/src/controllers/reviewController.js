const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Machine = require('../models/Machine');
const mongoose = require('mongoose');
const sendNotification = require('../utils/notificationHelper'); // 👇 Imported Helper
const { ERROR_CODES } = require('../config/constants');

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, wouldRecommend } = req.body;

    const booking = await Booking.findById(bookingId).populate('machineId');
    
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.farmerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) {
        return res.status(400).json({ success: false, message: 'Already reviewed' });
    }

    const review = await Review.create({
      bookingId,
      machineId: booking.machineId._id,
      ownerId: booking.ownerId,
      farmerId: req.user.id,
      rating,
      comment,
      wouldRecommend
    });

    await updateMachineRating(booking.machineId._id);

    // 👇 NOTIFICATION TO OWNER
    const io = req.app.get('io');
    sendNotification(
        io,
        booking.ownerId,
        'New Review Received',
        `A farmer rated your machine ${rating}/5 stars!`,
        'info'
    );

    res.status(201).json({ success: true, data: { review } });

  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMachineReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ machineId: req.params.machineId })
      .populate('farmerId', 'name')
      .sort({ createdAt: -1 })
      .skip(((page || 1) - 1) * (limit || 10))
      .limit(parseInt(limit || 10));
      
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.getBookingReview = async (req, res) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId });
    res.json({ success: true, data: { review: review || null } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getFarmerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ farmerId: req.user.id }).populate('machineId');
        res.json({ success: true, data: { reviews } });
    } catch (e) { res.status(500).json({ success: false }); }
};

exports.getOwnerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ ownerId: req.user.id }).populate('machineId');
        res.json({ success: true, data: { reviews } });
    } catch (e) { res.status(500).json({ success: false }); }
};

exports.getUserReviews = async (req, res) => {
    res.json({ success: true, data: { reviews: [] } });
};

async function updateMachineRating(machineId) {
    try {
        const result = await Review.aggregate([
            { $match: { machineId: mongoose.Types.ObjectId(machineId) } },
            { $group: { _id: '$machineId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        
        if (result.length > 0) {
            await Machine.findByIdAndUpdate(machineId, {
                'meta.averageRating': Math.round(result[0].avgRating * 10) / 10,
                'meta.reviewCount': result[0].count
            });
        }
    } catch (e) { console.error("Rating update failed", e); }
}