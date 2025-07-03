const express = require('express');
const User = require('../models/User');
const Investment = require('../models/Investment');
const { authenticateToken } = require('./auth');

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        profile: user.profile,
        reputationScore: user.reputationScore,
        totalInvested: user.totalInvested,
        totalBorrowed: user.totalBorrowed,
        isVerified: user.isVerified,
        userType: user.userType,
        joinedAt: user.joinedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { profile, userType } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    if (userType) {
      user.userType = userType;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        profile: user.profile,
        reputationScore: user.reputationScore,
        totalInvested: user.totalInvested,
        totalBorrowed: user.totalBorrowed,
        isVerified: user.isVerified,
        userType: user.userType,
        joinedAt: user.joinedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalInvestments = await Investment.countDocuments({
      $or: [
        { borrower: user._id },
        { investor: user._id }
      ]
    });

    const activeInvestments = await Investment.countDocuments({
      $or: [
        { borrower: user._id, status: 'active' },
        { investor: user._id, status: 'active' }
      ]
    });

    const completedInvestments = await Investment.countDocuments({
      $or: [
        { borrower: user._id, status: 'completed' },
        { investor: user._id, status: 'completed' }
      ]
    });

    const pendingInvestments = await Investment.countDocuments({
      borrower: user._id,
      status: 'pending'
    });

    const recentInvestments = await Investment.find({
      $or: [
        { borrower: user._id },
        { investor: user._id }
      ]
    })
    .populate('borrower investor', 'profile')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      dashboard: {
        user: {
          name: user.profile.name,
          reputationScore: user.reputationScore,
          totalInvested: user.totalInvested,
          totalBorrowed: user.totalBorrowed,
          isVerified: user.isVerified
        },
        stats: {
          totalInvestments,
          activeInvestments,
          completedInvestments,
          pendingInvestments
        },
        recentInvestments: recentInvestments.map(inv => ({
          id: inv._id,
          amount: inv.amount,
          purpose: inv.purpose,
          status: inv.status,
          createdAt: inv.createdAt,
          role: inv.borrower._id.toString() === user._id.toString() ? 'borrower' : 'investor'
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/reputation', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const investmentHistory = await Investment.find({
      $or: [
        { borrower: user._id },
        { investor: user._id }
      ]
    }).populate('borrower investor', 'profile');

    const reputationDetails = {
      currentScore: user.reputationScore,
      totalInvestments: investmentHistory.length,
      successfulInvestments: investmentHistory.filter(inv => inv.status === 'completed').length,
      defaultedInvestments: investmentHistory.filter(inv => inv.status === 'defaulted').length,
      onTimePayments: 0,
      latePayments: 0
    };

    investmentHistory.forEach(inv => {
      if (inv.repaymentSchedule) {
        inv.repaymentSchedule.forEach(payment => {
          if (payment.paid) {
            reputationDetails.onTimePayments++;
          }
        });
      }
    });

    res.json({
      reputation: reputationDetails,
      history: investmentHistory.map(inv => ({
        id: inv._id,
        amount: inv.amount,
        purpose: inv.purpose,
        status: inv.status,
        createdAt: inv.createdAt,
        role: inv.borrower._id.toString() === user._id.toString() ? 'borrower' : 'investor'
      }))
    });
  } catch (error) {
    console.error('Reputation error:', error);
    res.status(500).json({ error: 'Failed to fetch reputation data' });
  }
});

module.exports = router;