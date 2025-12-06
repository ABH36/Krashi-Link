const { ERROR_CODES } = require('../config/constants');

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_401,
          message: 'Authentication required'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTH_403,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        }
      });
    }

    next();
  };
};

// Check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user.verified) {
    return res.status(403).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTH_403,
        message: 'Account verification required. Please contact admin.'
      }
    });
  }
  next();
};

// Check if user owns resource
const requireOwnership = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[idParam]);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RESOURCE_404',
            message: 'Resource not found'
          }
        });
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Check ownership
      const ownerField = resource.ownerId ? 'ownerId' : 'userId';
      const ownerId = resource[ownerField] ? resource[ownerField].toString() : resource._id.toString();
      
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTH_403,
            message: 'Access denied. You do not own this resource.'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.SYS_500,
          message: 'Internal server error during ownership verification'
        }
      });
    }
  };
};

// Export all middleware functions
module.exports = {
  requireRole,
  requireVerified,
  requireOwnership
};