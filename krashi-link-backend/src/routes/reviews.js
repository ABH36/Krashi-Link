const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

// Create Review (Farmer Only)
router.post('/', verifyToken, requireRole(['farmer']), reviewController.createReview);

// Get Reviews for a specific Machine (Public)
router.get('/machine/:machineId', reviewController.getMachineReviews);

// Get My Reviews (Farmer)
router.get('/farmer/my-reviews', verifyToken, requireRole(['farmer']), reviewController.getFarmerReviews);

// Get My Reviews (Owner)
router.get('/owner/my-reviews', verifyToken, requireRole(['owner']), reviewController.getOwnerReviews);

// 👇 NEW ROUTE: Check if booking has a review
router.get('/booking/:bookingId', verifyToken, reviewController.getBookingReview);

// General User Reviews (Optional)
router.get('/user', verifyToken, reviewController.getUserReviews);

module.exports = router;