const { ERROR_CODES } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VAL_400,
        message: 'Validation failed',
        details: errors
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VAL_400,
        message: `${field} already exists`
      }
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VAL_400,
        message: 'Invalid ID format'
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTH_401,
        message: 'Invalid token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTH_401,
        message: 'Token expired'
      }
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.SYS_500,
      message: 'Internal server error'
    }
  });
};

module.exports = errorHandler;