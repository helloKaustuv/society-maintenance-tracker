const { validationResult } = require('express-validator');

/**
 * Validates request schema and formats error messages consistently
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg || 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  };
};

module.exports = {
  validate
};
