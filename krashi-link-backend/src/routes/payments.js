const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

// Protected routes
router.post('/initiate', verifyToken, requireRole(['farmer']), paymentController.initiatePayment);
router.post('/verify', verifyToken, paymentController.verifyPayment);
router.get('/user', verifyToken, paymentController.getUserTransactions);

// Admin only routes
router.post('/verify-admin', verifyToken, requireRole(['admin']), paymentController.verifyPaymentAdmin);
router.post('/refund', verifyToken, requireRole(['admin']), paymentController.refundPayment);
router.post('/payout/:bookingId', verifyToken, requireRole(['admin']), paymentController.releasePayout);

//fake payment after rozerpay you delete this


module.exports = router;