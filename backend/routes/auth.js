const express = require('express');
const jwt = require('jsonwebtoken');
const algosdk = require('algosdk');
const User = require('../models/User');

const router = express.Router();

router.post('/connect-wallet', async (req, res) => {
  try {
    const { walletAddress, signature, message, network } = req.body;
    
    // Enhanced validation
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['walletAddress', 'signature', 'message']
      });
    }

    // Validate wallet address format
    if (!walletAddress || typeof walletAddress !== 'string' || !/^[A-Z2-7]{58}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Validate signature format
    if (!signature || typeof signature !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(signature)) {
      return res.status(400).json({ error: 'Invalid signature format' });
    }
    
    if (signature.length < 10 || signature.length > 200) {
      return res.status(400).json({ error: 'Signature length is invalid' });
    }

    const isValid = algosdk.verifyBytes(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      walletAddress
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature verification failed' });
    }

    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = new User({
        walletAddress,
        profile: {
          name: '',
          email: '',
          location: '',
          phone: ''
        },
        reputationScore: 50,
        isVerified: false,
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profile_public: true,
            investment_history_public: false,
            risk_score_public: false
          },
          investment: {
            min_amount: 0.001,
            max_amount: 1000,
            preferred_risk_level: 'medium'
          }
        }
      });
      await user.save();
      console.log(`New user created: ${walletAddress}`);
    }

    const token = jwt.sign(
      { userId: user._id, walletAddress },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        profile: user.profile,
        reputationScore: user.reputationScore,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { walletAddress, profile } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        error: 'Wallet address is required',
        timestamp: new Date().toISOString()
      });
    }
    
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Wallet not connected. Please connect your wallet first.',
        timestamp: new Date().toISOString()
      });
    }

    // Validate profile data
    if (profile) {
      if (profile.name && profile.name.length > 100) {
        return res.status(400).json({
          error: 'Name cannot exceed 100 characters',
          timestamp: new Date().toISOString()
        });
      }
      
      if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        return res.status(400).json({
          error: 'Please provide a valid email address',
          timestamp: new Date().toISOString()
        });
      }
    }

    if (profile) {
      const allowedFields = ['name', 'email', 'location', 'phone'];
      const filteredProfile = {};
      
      allowedFields.forEach(field => {
        if (profile[field] !== undefined) {
          filteredProfile[field] = profile[field];
        }
      });
      
      user.profile = { ...user.profile, ...filteredProfile };
    }
    
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        profile: user.profile,
        reputationScore: user.reputationScore,
        isVerified: user.isVerified
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      timestamp: new Date().toISOString()
    });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      timestamp: new Date().toISOString(),
      code: 'NO_TOKEN'
    });
  }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        console.warn('JWT verification failed:', err.message, 'IP:', req.ip);
        return res.status(403).json({ 
          error: 'Invalid or expired token',
          timestamp: new Date().toISOString(),
          code: 'INVALID_TOKEN',
          expiresIn: err.expiredAt ? new Date(err.expiredAt).toISOString() : null
        });
      }
    
    // Add session info to request
    req.user = user;
    req.sessionStart = Date.now();
    req.userAgent = req.headers['user-agent'] || 'unknown';
    
    next();
  });
};

// Session management middleware
const trackSession = (req, res, next) => {
  if (req.user) {
    // Log user activity
    req.user.logActivity('api_access', {
      endpoint: req.path,
      method: req.method,
      ip: req.ip
    }, req.ip, req.headers['user-agent']).catch(err => {
      console.warn('Failed to log activity:', err);
    });
  }
  next();
};

module.exports = { router, authenticateToken };