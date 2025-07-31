const Joi = require('joi');
const { validationResult } = require('express-validator');
const xss = require('xss');

// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input.trim());
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

// Generic validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // Sanitize validated data
    req.body = sanitizeInput(value);
    next();
  };
};

// Investment creation schema
const investmentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  purpose: Joi.string().min(10).max(500).required(),
  interest_rate: Joi.number().min(0).max(100).required(),
  duration: Joi.number().positive().required(),
  description: Joi.string().max(1000).optional()
});

// User registration schema
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  wallet_address: Joi.string().required(),
  full_name: Joi.string().min(2).max(100).required()
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Risk assessment schema
const riskAssessmentSchema = Joi.object({
  income_level: Joi.string().valid('low', 'medium', 'high').required(),
  credit_history: Joi.string().valid('none', 'poor', 'fair', 'good', 'excellent').required(),
  employment_status: Joi.string().valid('employed', 'self_employed', 'unemployed', 'student').required(),
  monthly_income: Joi.number().positive().required(),
  existing_debts: Joi.number().min(0).required(),
  purpose: Joi.string().min(10).max(500).required()
});

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts');
const investmentRateLimiter = createRateLimiter(60 * 1000, 10, 'Too many investment requests');
const generalRateLimiter = createRateLimiter(60 * 1000, 100, 'Too many requests');

module.exports = {
  validateRequest,
  sanitizeInput,
  investmentSchema,
  userRegistrationSchema,
  loginSchema,
  riskAssessmentSchema,
  authRateLimiter,
  investmentRateLimiter,
  generalRateLimiter
}; 