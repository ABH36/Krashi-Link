const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const { requireRole, requireVerified } = require('../middlewares/role');
const validate = require('../middlewares/validation');

// --- 🛡️ VALIDATION SCHEMAS ---

// 1. Register Schema (Added for safety)
const registerSchema = {
  body: {
    name: { type: 'string', required: true, minLength: 2 },
    phone: { type: 'string', pattern: /^[6-9]\d{9}$/, required: true },
    password: { type: 'string', minLength: 6, required: true },
    role: { type: 'string', enum: ['farmer', 'owner'], required: true }
  }
};

const loginSchema = {
  body: {
    phone: { type: 'string', pattern: /^[6-9]\d{9}$/, required: true },
    password: { type: 'string', required: true }
  }
};

// 2. Forgot Password Schema (New)
const forgotPasswordSchema = {
  body: {
    phone: { type: 'string', pattern: /^[6-9]\d{9}$/, required: true }
  }
};

// 3. Reset Password Schema (New)
const resetPasswordSchema = {
  body: {
    phone: { type: 'string', pattern: /^[6-9]\d{9}$/, required: true },
    otp: { type: 'string', length: 6, required: true },
    newPassword: { type: 'string', minLength: 6, required: true }
  }
};

const twoFASchema = {
  body: {
    channel: { type: 'string', enum: ['sms', 'email'], required: true }
  }
};

// Fixed: Changed 'name' to 'code' because 2FA requires OTP code
const verify2FASchema = {
  body: {
    code: { type: "string", required: true, length: 6 }
  }
};

// --- 🛣️ ROUTES ---

// Public routes
router.post('/register', validate(registerSchema), authController.register); // Added validation
router.post('/login', validate(loginSchema), authController.login);

// ✅ NEW: Forgot & Reset Password (With Validation)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get('/me', verifyToken, authController.getMe);

// 2FA Routes
router.post('/2fa/send', verifyToken, requireRole(['owner', 'admin']), requireVerified, validate(twoFASchema), authController.send2FA);
router.post('/2fa/verify', verifyToken, requireRole(['owner', 'admin']), requireVerified, validate(verify2FASchema), authController.verify2FA);

module.exports = router;