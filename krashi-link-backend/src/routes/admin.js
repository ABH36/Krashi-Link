const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


const { verifyToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

const validate = require('../middlewares/validation');


// Validation schemas
const verifyUserSchema = {
  body: {
    verified: { type: 'boolean', required: true }
  }
};

const resolveDisputeSchema = {
  body: {
    resolution: { type: 'string', required: true },
    refundAmount: { type: 'number', min: 0, optional: true }
  }
};

// Admin only routes
router.get('/users', verifyToken, requireRole(['admin']), adminController.getUsers);
router.put('/verify/:userId', verifyToken, requireRole(['admin']), validate(verifyUserSchema), adminController.verifyUser);
router.get('/analytics', verifyToken, requireRole(['admin']), adminController.getAnalytics);
router.post('/disputes/:bookingId/resolve', verifyToken, requireRole(['admin']), validate(resolveDisputeSchema), adminController.resolveDispute);
router.get('/bookings', verifyToken, requireRole(['admin']), adminController.getBookings);
router.get('/transactions/pending', verifyToken, requireRole(['admin']), adminController.getPendingTransactions);
router.get('/logs', verifyToken, requireRole(['admin']), adminController.getSystemLogs);
router.post('/broadcast', verifyToken, requireRole(['admin']), adminController.sendBroadcast);

module.exports = router;