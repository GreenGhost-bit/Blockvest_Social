const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError, logger } = require('./errorHandler');
const User = require('../models/User');

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    throw new AuthenticationError('Authentication failed');
  }
};

// Optional token verification (doesn't throw error if no token)
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const userRole = req.user.role || 'user';
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
};

// Check if user owns the resource or has admin role
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    const isOwner = req.user.id === resourceUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AuthorizationError('Access denied');
    }

    next();
  };
};

// Rate limiting for authentication endpoints
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    walletAddress: user.wallet_address,
    verified: user.verified,
    riskScore: user.risk_score
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Refresh token
const refreshToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('Refresh token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Check if user still exists
    User.findById(decoded.id)
      .then(user => {
        if (!user) {
          throw new AuthenticationError('User not found');
        }

        // Generate new token
        const newToken = generateToken(user);
        
        res.json({
          success: true,
          token: newToken,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            walletAddress: user.wallet_address,
            verified: user.verified,
            riskScore: user.risk_score
          }
        });
      })
      .catch(error => {
        logger.error('Token refresh failed', { error: error.message });
        throw new AuthenticationError('Token refresh failed');
      });
  } catch (error) {
    next(error);
  }
};

// Validate wallet address ownership
const validateWalletOwnership = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return next();
    }

    // Check if wallet address is already associated with another user
    const existingUser = await User.findOne({ 
      wallet_address: walletAddress,
      _id: { $ne: req.user?.id }
    });

    if (existingUser) {
      throw new AuthenticationError('Wallet address already associated with another account');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Log authentication events
const logAuthEvent = (event, userId, details = {}) => {
  logger.info('Authentication event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Session management
const sessionMiddleware = (req, res, next) => {
  // Add session tracking
  req.sessionId = req.headers['x-session-id'] || req.user?.id || 'anonymous';
  
  // Log session activity
  logger.info('Session activity', {
    sessionId: req.sessionId,
    userId: req.user?.id || 'anonymous',
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  next();
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (!req.user.verified) {
    throw new AuthorizationError('Account verification required');
  }

  next();
};

// Check if user has completed risk assessment
const requireRiskAssessment = (req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (req.user.riskScore === undefined || req.user.riskScore === null) {
    throw new AuthorizationError('Risk assessment required');
  }

  next();
};

// MFA verification middleware
const requireMFA = (req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  const mfaToken = req.headers['x-mfa-token'];
  
  if (!mfaToken) {
    throw new AuthenticationError('MFA token required');
  }

  // Verify MFA token (implementation depends on your MFA setup)
  // This is a placeholder - implement actual MFA verification
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  requireOwnership,
  authRateLimit,
  generateToken,
  refreshToken,
  validateWalletOwnership,
  logAuthEvent,
  sessionMiddleware,
  requireVerification,
  requireRiskAssessment,
  requireMFA
}; 