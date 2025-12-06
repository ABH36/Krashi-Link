const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const { ERROR_CODES } = require('../config/constants');
const sendNotification = require('../utils/notificationHelper');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    console.log("REGISTER API HIT", req.body);
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Phone number already registered" });
    }

    const user = new User({ name, phone, password, role });
    await user.save();

    // 👇 NOTIFY ADMIN: New User Registered
    const io = req.app.get('io');
    sendNotification(
        io, 
        'ADMIN', 
        'New User Registration', 
        `${name} (${role}) has registered. Please verify.`, 
        'info'
    );

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: user.toJSON()
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VAL_400,
          message: 'Phone and password are required'
        }
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_401,
          message: 'Invalid phone or password'
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_401,
          message: 'Invalid phone or password'
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Log login
    await AuditLog.create({
      actorId: user._id,
      role: user.role,
      action: 'USER_LOGIN',
      entity: { type: 'user', id: user._id },
      metadata: { phone }
    });

    res.json({
      success: true,
      data: {
        token,
        role: user.role,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          verified: user.verified,
          lang: user.lang,
          trustScore: user.trustScore,
          role: user.role
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error during login'
      }
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_401,
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while fetching profile'
      }
    });
  }
};

// Send 2FA (stub for future implementation)
exports.send2FA = async (req, res) => {
  try {
    const { channel } = req.body;
    
    // Stub implementation - just log for now
    console.log(`2FA requested via ${channel} for user:`, req.user.id);
    
    // Log 2FA attempt
    await AuditLog.create({
      actorId: req.user.id,
      role: req.user.role,
      action: '2FA_SENT',
      entity: { type: 'user', id: req.user.id },
      metadata: { channel }
    });

    res.json({
      success: true,
      data: { sent: true },
      message: `2FA code sent via ${channel} (stub)`
    });

  } catch (error) {
    console.error('2FA send error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while sending 2FA'
      }
    });
  }
};

// Verify 2FA (stub for future implementation)
exports.verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Stub implementation - accept any code for now
    console.log(`2FA verification attempted with code: ${code} for user:`, req.user.id);
    
    // Log 2FA verification
    await AuditLog.create({
      actorId: req.user.id,
      role: req.user.role,
      action: '2FA_VERIFIED',
      entity: { type: 'user', id: req.user.id },
      metadata: { code }
    });

    res.json({
      success: true,
      data: { verified: true },
      message: '2FA verification successful (stub)'
    });

  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error while verifying 2FA'
      }
    });
  }
};