const logger = require('../utils/logger');

// Custom error classes for better error handling
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, true);
    this.details = details;
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, true);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, true);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error occurred:', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    },
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message, err.errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} with value '${value}' already exists`;
    error = new ConflictError(message);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ValidationError('File too large');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = new ValidationError('Too many files');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new ValidationError('Unexpected file field');
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = new RateLimitError('Too many requests, please try again later');
  }

  // Socket.IO errors
  if (err.type === 'TransportError') {
    logger.warn('Socket.IO transport error:', err);
    return next();
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        stack: err.stack,
        details: error.details || null,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
      }
    });
  } else {
    // Production error response
    res.status(statusCode).json({
      success: false,
      error: {
        message: statusCode === 500 ? 'Internal Server Error' : message,
        statusCode,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Async error wrapper for async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error boundary for unhandled promise rejections
const handleUnhandledRejection = (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Close server gracefully
  process.exit(1);
};

// Error boundary for uncaught exceptions
const handleUncaughtException = (error) => {
  logger.error('Uncaught Exception:', error);
  
  // Close server gracefully
  process.exit(1);
};

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close database connections
  if (global.db) {
    global.db.close(() => {
      logger.info('Database connection closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Set up error handlers
const setupErrorHandlers = () => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupErrorHandlers,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
}; 