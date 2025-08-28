const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'blockvest-social',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Access log file
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Security log file
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ],
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 3
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 3
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Add console transport in production for critical logs
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    level: 'error',
    format: winston.format.simple()
  }));
}

// Custom logging methods
logger.startup = (message, meta = {}) => {
  logger.info(`🚀 ${message}`, { ...meta, category: 'startup' });
};

logger.shutdown = (message, meta = {}) => {
  logger.info(`🛑 ${message}`, { ...meta, category: 'shutdown' });
};

logger.database = (message, meta = {}) => {
  logger.info(`🗄️ ${message}`, { ...meta, category: 'database' });
};

logger.blockchain = (message, meta = {}) => {
  logger.info(`⛓️ ${message}`, { ...meta, category: 'blockchain' });
};

logger.security = (message, meta = {}) => {
  logger.warn(`🔒 ${message}`, { ...meta, category: 'security' });
};

logger.performance = (message, meta = {}) => {
  logger.info(`⚡ ${message}`, { ...meta, category: 'performance' });
};

logger.user = (message, meta = {}) => {
  logger.info(`👤 ${message}`, { ...meta, category: 'user' });
};

logger.investment = (message, meta = {}) => {
  logger.info(`💰 ${message}`, { ...meta, category: 'investment' });
};

logger.notification = (message, meta = {}) => {
  logger.info(`🔔 ${message}`, { ...meta, category: 'notification' });
};

logger.mfa = (message, meta = {}) => {
  logger.info(`🔐 ${message}`, { ...meta, category: 'mfa' });
};

logger.verification = (message, meta = {}) => {
  logger.info(`✅ ${message}`, { ...meta, category: 'verification' });
};

logger.governance = (message, meta = {}) => {
  logger.info(`🏛️ ${message}`, { ...meta, category: 'governance' });
};

logger.risk = (message, meta = {}) => {
  logger.info(`⚠️ ${message}`, { ...meta, category: 'risk' });
};

logger.analytics = (message, meta = {}) => {
  logger.info(`📊 ${message}`, { ...meta, category: 'analytics' });
};

logger.socket = (message, meta = {}) => {
  logger.info(`🔌 ${message}`, { ...meta, category: 'socket' });
};

logger.api = (message, meta = {}) => {
  logger.info(`🌐 ${message}`, { ...meta, category: 'api' });
};

logger.middleware = (message, meta = {}) => {
  logger.info(`🔧 ${message}`, { ...meta, category: 'middleware' });
};

logger.validation = (message, meta = {}) => {
  logger.warn(`📝 ${message}`, { ...meta, category: 'validation' });
};

logger.rateLimit = (message, meta = {}) => {
  logger.warn(`⏱️ ${message}`, { ...meta, category: 'rate_limit' });
};

logger.fileUpload = (message, meta = {}) => {
  logger.info(`📁 ${message}`, { ...meta, category: 'file_upload' });
};

logger.email = (message, meta = {}) => {
  logger.info(`📧 ${message}`, { ...meta, category: 'email' });
};

logger.sms = (message, meta = {}) => {
  logger.info(`📱 ${message}`, { ...meta, category: 'sms' });
};

logger.push = (message, meta = {}) => {
  logger.info(`📲 ${message}`, { ...meta, category: 'push_notification' });
};

logger.cache = (message, meta = {}) => {
  logger.info(`💾 ${message}`, { ...meta, category: 'cache' });
};

logger.queue = (message, meta = {}) => {
  logger.info(`📋 ${message}`, { ...meta, category: 'queue' });
};

logger.schedule = (message, meta = {}) => {
  logger.info(`⏰ ${message}`, { ...meta, category: 'schedule' });
};

logger.backup = (message, meta = {}) => {
  logger.info(`💿 ${message}`, { ...meta, category: 'backup' });
};

logger.monitoring = (message, meta = {}) => {
  logger.info(`📈 ${message}`, { ...meta, category: 'monitoring' });
};

logger.health = (message, meta = {}) => {
  logger.info(`❤️ ${message}`, { ...meta, category: 'health' });
};

logger.test = (message, meta = {}) => {
  logger.info(`🧪 ${message}`, { ...meta, category: 'test' });
};

logger.debug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`🐛 ${message}`, { ...meta, category: 'debug' });
  }
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      contentLength: req.get('Content-Length'),
      responseSize: res.get('Content-Length')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('API Request', logData);
    } else {
      logger.api('API Request', logData);
    }
  });
  
  next();
};

// Log rotation utility
const rotateLogs = () => {
  const logFiles = ['error.log', 'combined.log', 'access.log', 'security.log'];
  
  logFiles.forEach(filename => {
    const filePath = path.join(logsDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB > 10) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newFilename = `${filename.replace('.log', '')}_${timestamp}.log`;
        fs.renameSync(filePath, path.join(logsDir, newFilename));
        logger.info(`Log file rotated: ${filename} -> ${newFilename}`);
      }
    }
  });
};

// Schedule log rotation (every hour)
setInterval(rotateLogs, 60 * 60 * 1000);

module.exports = {
  logger,
  requestLogger,
  rotateLogs
};
