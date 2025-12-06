const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ERROR_CODES } = require('../config/constants');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_401,
          message: 'Access denied. No token provided.'
        }
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_401,
            message: 'Invalid token. User not found.'
          }
        });
      }

      // Attach user to request
      req.user = {
        id: user._id,
        role: user.role,
        verified: user.verified,
        lang: user.lang
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_401,
          message: 'Invalid or expired token'
        }
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.SYS_500,
        message: 'Internal server error in authentication'
      }
    });
  }
};

// Optional token verification (for public routes that can have optional auth)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
          req.user = {
            id: user._id,
            role: user.role,
            verified: user.verified,
            lang: user.lang
          };
        }
      } catch (jwtError) {
        // Silently fail for optional auth
        console.log('Optional auth token invalid:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Export middleware functions
module.exports = {
  verifyToken,
  optionalAuth
};