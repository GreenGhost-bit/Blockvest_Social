const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked due to multiple failed login attempts',
        code: 'ACCOUNT_LOCKED',
        retryAfter: user.account_locked_until
      });
    }

    // Check if user is verified (for sensitive operations)
    if (req.requireVerification && !user.verified) {
      return res.status(403).json({ 
        error: 'Account verification required for this operation',
        code: 'VERIFICATION_REQUIRED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based authorization middleware
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Resource ownership middleware
const authorizeOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({ 
          error: 'Resource ID required',
          code: 'RESOURCE_ID_MISSING'
        });
      }

      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ 
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check if user owns the resource or is admin
      const isOwner = resource.user && resource.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          error: 'Access denied - resource ownership required',
          code: 'OWNERSHIP_REQUIRED'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership authorization error:', error);
      return res.status(500).json({ 
        error: 'Authorization failed',
        code: 'AUTH_ERROR'
      });
    }
  };
};

// Rate limiting middleware for specific actions
const rateLimitAction = (action, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = `${req.user._id}-${action}`;
    const now = Date.now();
    const userAttempts = attempts.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > userAttempts.resetTime) {
      userAttempts.count = 0;
      userAttempts.resetTime = now + windowMs;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({ 
        error: `Too many ${action} attempts. Please try again later.`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
      });
    }
    
    userAttempts.count++;
    attempts.set(key, userAttempts);
    
    next();
  };
};

// Verification required middleware
const requireVerification = (req, res, next) => {
  req.requireVerification = true;
  next();
};

// Enhanced session validation
const validateSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    // Check if user's session is still valid
    const lastActive = new Date(req.user.last_active);
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    if (Date.now() - lastActive.getTime() > sessionTimeout) {
      return res.status(401).json({ 
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Update last active timestamp
    req.user.last_active = new Date();
    await req.user.save();

    next();
  } catch (error) {
    console.error('Session validation error:', error);
    next();
  }
};

// IP-based security middleware
const validateIP = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({ 
        error: 'Access denied from this IP address',
        code: 'IP_NOT_ALLOWED'
      });
    }

    next();
  };
};

// Enhanced error handling for auth failures
const handleAuthError = (error, req, res, next) => {
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'AUTH_FAILED'
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({ 
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  }

  next(error);
};

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    const auditData = {
      action,
      userId: req.user?._id,
      userEmail: req.user?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      method: req.method,
      path: req.path,
      params: req.params,
      body: req.body
    };

    // Log audit data (you can implement your own logging mechanism)
    console.log('AUDIT:', JSON.stringify(auditData, null, 2));
    
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeOwnership,
  rateLimitAction,
  requireVerification,
  validateSession,
  validateIP,
  handleAuthError,
  auditLog
}; 