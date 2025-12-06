const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

// Debug route (Must be before /:id to avoid conflict)
router.get('/debug/user', verifyToken, bookingController.debugUser);

// Owner specific routes
router.get('/owner/my-bookings', verifyToken, requireRole(['owner']), bookingController.getOwnerBookings);

// Create Booking (Farmer)
router.post('/', verifyToken, requireRole(['farmer']), bookingController.createBooking);

// Get User Bookings (General)
router.get('/user', verifyToken, bookingController.getUserBookings);

// Actions on Booking ID
router.put('/:id/confirm', verifyToken, bookingController.confirmBooking);
router.put('/:id/verify-arrival', verifyToken, bookingController.verifyArrival);
router.put('/:id/verify-completion', verifyToken, bookingController.verifyCompletion);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);

// Dispute & OTP
router.post('/:id/dispute', verifyToken, bookingController.createDispute);
router.post('/:id/resend-otp', verifyToken, bookingController.resendOTP);

// Get Single Booking (Must be last to avoid capturing other routes as ID)
router.get('/:id', verifyToken, bookingController.getBookingById);

module.exports = router;