const { ERROR_CODES } = require('../config/constants');

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body);
      if (bodyErrors.length > 0) {
        errors.push(...bodyErrors.map(err => `Body: ${err}`));
      }
    }

    // Validate query
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query);
      if (queryErrors.length > 0) {
        errors.push(...queryErrors.map(err => `Query: ${err}`));
      }
    }

    // Validate params
    if (schema.params) {
      const paramsErrors = validateObject(req.params, schema.params);
      if (paramsErrors.length > 0) {
        errors.push(...paramsErrors.map(err => `Params: ${err}`));
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VAL_400,
          message: 'Validation failed',
          details: errors
        }
      });
    }

    next();
  };
};

const validateObject = (obj, schema) => {
  const errors = [];

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    const isRequired = rules.required !== false; // Default to required

    // Check required fields
    if (isRequired && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    // Skip validation if field is optional and not provided
    if (!isRequired && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${key} must be a ${rules.type}`);
      continue;
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
    }

    // Pattern validation (for strings)
    if (rules.pattern && typeof value === 'string') {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push(`${key} format is invalid`);
      }
    }

    // Min length validation
    if (rules.min !== undefined) {
      if (typeof value === 'string' && value.length < rules.min) {
        errors.push(`${key} must be at least ${rules.min} characters`);
      } else if (typeof value === 'number' && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
      }
    }

    // Max length validation
    if (rules.max !== undefined) {
      if (typeof value === 'string' && value.length > rules.max) {
        errors.push(`${key} cannot exceed ${rules.max} characters`);
      } else if (typeof value === 'number' && value > rules.max) {
        errors.push(`${key} cannot exceed ${rules.max}`);
      }
    }
  }

  return errors;
};

module.exports = validate;