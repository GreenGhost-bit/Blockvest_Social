const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
  // File transport for errors
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info(`${req.method} ${req.url} ${res.statusCode}`, {
      duration: `${duration}ms`,
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error(`${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  next(err);
};

// Performance logging middleware
const performanceLogger = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1e6;
    
    if (duration > 1000) { // Log slow requests (> 1 second)
      logger.warn(`Slow request detected: ${req.method} ${req.url}`, {
        duration: `${duration.toFixed(2)}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
  ];

  const url = req.url;
  const userAgent = req.get('User-Agent') || '';
  const body = JSON.stringify(req.body || {});

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent) || pattern.test(body)) {
      logger.warn(`Suspicious activity detected`, {
        pattern: pattern.toString(),
        url,
        userAgent,
        ip: req.ip,
        body: body.substring(0, 500), // Limit body size
        timestamp: new Date().toISOString(),
      });
    }
  }

  next();
};

// Database logging middleware
const databaseLogger = (operation, collection, query, duration) => {
  logger.debug(`Database operation: ${operation}`, {
    collection,
    query: JSON.stringify(query),
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
};

// Business logic logging
const businessLogger = {
  userAction: (action, userId, details = {}) => {
    logger.info(`User action: ${action}`, {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  investmentEvent: (event, investmentId, details = {}) => {
    logger.info(`Investment event: ${event}`, {
      investmentId,
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  walletEvent: (event, walletAddress, details = {}) => {
    logger.info(`Wallet event: ${event}`, {
      walletAddress,
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  smartContractEvent: (event, contractAddress, details = {}) => {
    logger.info(`Smart contract event: ${event}`, {
      contractAddress,
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

// Metrics logging
const metricsLogger = {
  recordMetric: (name, value, tags = {}) => {
    logger.info(`Metric: ${name}`, {
      metric: name,
      value,
      tags,
      timestamp: new Date().toISOString(),
    });
  },

  recordCounter: (name, increment = 1, tags = {}) => {
    logger.info(`Counter: ${name}`, {
      counter: name,
      increment,
      tags,
      timestamp: new Date().toISOString(),
    });
  },

  recordTimer: (name, duration, tags = {}) => {
    logger.info(`Timer: ${name}`, {
      timer: name,
      duration,
      tags,
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = {
  logger,
  stream,
  requestLogger,
  errorLogger,
  performanceLogger,
  securityLogger,
  databaseLogger,
  businessLogger,
  metricsLogger,
};
