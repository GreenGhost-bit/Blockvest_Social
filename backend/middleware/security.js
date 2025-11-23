const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const cors = require('cors');
const { logger } = require('../utils/logger');

// Security configuration
const securityConfig = {
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'X-API-Key',
      'X-Client-Version',
      'X-Device-ID'
    ],
    exposedHeaders: [
      'X-Total-Count', 
      'X-Page-Count', 
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset'
    ],
    maxAge: 86400 // 24 hours
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    handler: (req, res) => {
      logger.rateLimit('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.originalUrl
      });
      
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(securityConfig.rateLimit.windowMs / 1000 / 60)
      });
    }
  },

  // Strict rate limiting for sensitive endpoints
  strictRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    handler: (req, res) => {
      logger.security('Strict rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.originalUrl
      });
      
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 15
      });
    }
  },

  // Speed limiting configuration
  speedLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: 500, // begin adding 500ms delay per request above 50
    maxDelayMs: 20000, // max delay of 20 seconds
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Helmet configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: [
          "'self'", 
          "https://testnet-api.algonode.cloud", 
          "https://testnet-idx.algonode.cloud",
          "wss:",
          "ws:"
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  }
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          // Remove null bytes and other dangerous characters
          req.body[key] = req.body[key]
            .replace(/\0/g, '')
            .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
            .trim();
          
          // Limit string length to prevent DoS
          if (req.body[key].length > 10000) {
            req.body[key] = req.body[key].substring(0, 10000);
          }
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key]
            .replace(/\0/g, '')
            .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
            .trim();
        }
      });
    }

    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = req.params[key]
            .replace(/\0/g, '')
            .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
            .trim();
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error', { error: error.message });
    next(error);
  }
};

// Request size limiting middleware
const limitRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0', 10);
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE || '10485760', 10); // 10MB default

  if (isNaN(contentLength) || contentLength < 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Content-Length header'
    });
  }

  if (contentLength > maxSize) {
    logger.security('Request size limit exceeded', {
      ip: req.ip,
      contentLength,
      maxSize,
      path: req.originalUrl
    });

    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
      maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`
    });
  }

  next();
};

// IP address validation middleware
const validateIP = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Check if IP is valid
  if (!ip || ip === 'unknown') {
    logger.security('Invalid IP address detected', {
      ip,
      userAgent: req.get('User-Agent'),
      path: req.originalUrl
    });
    
    return res.status(400).json({
      success: false,
      error: 'Invalid IP address'
    });
  }

  // Check for private/local IP addresses in production
  if (process.env.NODE_ENV === 'production') {
    const privateIPs = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    if (privateIPs.some(pattern => pattern.test(ip))) {
      logger.security('Private IP address access attempt', {
        ip,
        userAgent: req.get('User-Agent'),
        path: req.originalUrl
      });
      
      return res.status(403).json({
        success: false,
        error: 'Access denied from private IP address'
      });
    }
  }

  next();
};

// User agent validation middleware
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    logger.security('Missing User-Agent header', {
      ip: req.ip,
      path: req.originalUrl
    });
    
    return res.status(400).json({
      success: false,
      error: 'User-Agent header is required'
    });
  }

  // Check for suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i,
    /ruby/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logger.security('Suspicious User-Agent detected', {
      ip: req.ip,
      userAgent,
      path: req.originalUrl
    });
    
    // Allow but log for monitoring
  }

  next();
};

// Request timing middleware
const requestTiming = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) { // 1 second
      logger.performance('Slow request detected', {
        method: req.method,
        path: req.originalUrl,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Add timing header
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

// API key validation middleware
const validateAPIKey = (req, res, next) => {
  const apiKey = req.get('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required'
    });
  }

  // Validate API key format (basic validation)
  if (!/^[A-Za-z0-9]{32,64}$/.test(apiKey)) {
    logger.security('Invalid API key format', {
      ip: req.ip,
      path: req.originalUrl
    });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid API key format'
    });
  }

  // TODO: Implement actual API key validation logic
  // For now, just pass through
  
  next();
};

// Create rate limiters
const createRateLimiters = () => {
  const generalLimiter = rateLimit(securityConfig.rateLimit);
  const strictLimiter = rateLimit(securityConfig.strictRateLimit);
  const speedLimiter = slowDown(securityConfig.speedLimit);

  return {
    general: generalLimiter,
    strict: strictLimiter,
    speed: speedLimiter
  };
};

// Apply security middleware
const applySecurityMiddleware = (app) => {
  // Apply Helmet with custom configuration
  app.use(helmet(securityConfig.helmet));
  
  // Apply CORS
  app.use(cors(securityConfig.cors));
  
  // Apply rate limiting
  const limiters = createRateLimiters();
  app.use('/api/', limiters.general);
  app.use('/api/auth', limiters.strict);
  app.use('/api/', limiters.speed);
  
  // Apply custom security middleware
  app.use(validateIP);
  app.use(validateUserAgent);
  app.use(sanitizeInput);
  app.use(limitRequestSize);
  app.use(securityHeaders);
  app.use(requestTiming);
  
  // Log security events
  app.use((req, res, next) => {
    // Log suspicious requests
    if (req.method === 'POST' && req.path.includes('/auth')) {
      logger.security('Authentication attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  });
  
  logger.security('Security middleware applied successfully');
};

// Export security utilities
module.exports = {
  applySecurityMiddleware,
  validateAPIKey,
  securityConfig,
  sanitizeInput,
  limitRequestSize,
  validateIP,
  validateUserAgent,
  requestTiming,
  securityHeaders
};
