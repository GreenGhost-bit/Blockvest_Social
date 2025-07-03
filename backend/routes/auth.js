const express = require('express');
const jwt = require('jsonwebtoken');
const algosdk = require('algosdk');
const User = require('../models/User');

const router = express.Router();

router.post('/connect-wallet', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = algosdk.verifyBytes(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      walletAddress
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
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
        }
      });
      await user.save();
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
    
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'Wallet not connected' });
    }

    user.profile = { ...user.profile, ...profile };
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        profile: user.profile,
        reputationScore: user.reputationScore,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { router, authenticateToken };