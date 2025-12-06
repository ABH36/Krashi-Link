const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole, requireVerified } = require('../middlewares/role');
const validate = require('../middlewares/validation');

// Validation schemas


const loginSchema = {
  body: {
    phone: { type: 'string', pattern: /^[6-9]\d{9}$/, required: true },
    password: { type: 'string', required: true }
  }
};

const twoFASchema = {
  body: {
    channel: { type: 'string', enum: ['sms', 'email'], required: true }
  }
};

const verify2FASchema = {
  body: {
    name: { type: "string", required: true }

  }
};

// Public routes
router.post('/register', authController.register);

router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getMe);
router.post('/2fa/send', verifyToken, requireRole(['owner', 'admin']), requireVerified, validate(twoFASchema), authController.send2FA);
router.post('/2fa/verify', verifyToken, requireRole(['owner', 'admin']), requireVerified, validate(verify2FASchema), authController.verify2FA);

module.exports = router;