const express = require('express');
const algosdk = require('algosdk');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { authenticateToken } = require('./auth');

const router = express.Router();

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const totalInvestments = await Investment.countDocuments({
      createdAt: { $gte: startDate }
    });

    const investments = await Investment.find({
      createdAt: { $gte: startDate }
    });

    const totalVolume = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const averageInvestmentSize = totalInvestments > 0 ? totalVolume / totalInvestments : 0;

    const completedInvestments = investments.filter(inv => inv.status === 'completed').length;
    const successRate = totalInvestments > 0 ? (completedInvestments / totalInvestments) * 100 : 0;

    const activeUsers = await User.countDocuments({
      joinedAt: { $gte: startDate }
    });

    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setTime(previousPeriodStart.getTime() - (now.getTime() - startDate.getTime()));
    
    const previousInvestments = await Investment.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });

    const monthlyGrowth = previousInvestments > 0 
      ? ((totalInvestments - previousInvestments) / previousInvestments) * 100 
      : 100;

    const algorandClient = req.app.locals.algodClient;
    let algorandTransactions = 0;
    let averageBlockTime = 4.5;
    let networkHealth = 'healthy';

    try {
      const nodeStatus = await algorandClient.status().do();
      averageBlockTime = nodeStatus['time-since-last-round'] || 4.5;
      networkHealth = averageBlockTime < 6 ? 'healthy' : averageBlockTime < 10 ? 'degraded' : 'down';
      
      const lastRound = nodeStatus['last-round'];
      const blockInfo = await algorandClient.block(lastRound).do();
      algorandTransactions = blockInfo.block.txns ? blockInfo.block.txns.length : 0;
    } catch (error) {
      console.error('Error fetching Algorand data:', error);
      networkHealth = 'degraded';
    }

    const platformFees = totalVolume * 0.025;

    const recentTransactions = investments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(inv => ({
        id: inv._id.toString(),
        type: inv.status === 'pending' ? 'Investment Created' : 
              inv.status === 'active' ? 'Investment Funded' : 
              inv.status === 'completed' ? 'Investment Completed' : 'Investment Defaulted',
        amount: inv.amount,
        timestamp: inv.createdAt,
        status: inv.status === 'pending' ? 'pending' : 'confirmed'
      }));

    const investmentTrends = await generateInvestmentTrends(startDate, now);

    const analyticsData = {
      totalInvestments,
      totalVolume,
      averageInvestmentSize,
      successRate,
      platformFees,
      activeUsers,
      monthlyGrowth,
      algorandTransactions,
      averageBlockTime,
      networkHealth,
      recentTransactions,
      investmentTrends
    };

    res.json({ data: analyticsData });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

router.get('/network-health', async (req, res) => {
  try {
    const algodClient = req.app.locals.algodClient;
    const indexerClient = req.app.locals.indexerClient;

    const nodeStatus = await algodClient.status().do();
    const nodeHealth = await algodClient.healthCheck().do();
    
    const lastRound = nodeStatus['last-round'];
    const blockTime = nodeStatus['time-since-last-round'];
    
    let indexerHealth = 'unknown';
    try {
      await indexerClient.makeHealthCheck().do();
      indexerHealth = 'healthy';
    } catch (error) {
      indexerHealth = 'unhealthy';
    }

    const networkMetrics = {
      lastRound,
      blockTime,
      nodeHealth: nodeHealth ? 'healthy' : 'unhealthy',
      indexerHealth,
      timestamp: new Date().toISOString()
    };

    res.json({ data: networkMetrics });
  } catch (error) {
    console.error('Network health error:', error);
    res.status(500).json({ error: 'Failed to fetch network health' });
  }
});

router.get('/transaction-volume', authenticateToken, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const volumeData = await Investment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['active', 'completed'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalVolume: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({ data: volumeData });
  } catch (error) {
    console.error('Transaction volume error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction volume data' });
  }
});

router.get('/user-growth', authenticateToken, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const userGrowth = await User.aggregate([
      {
        $match: {
          joinedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joinedAt' },
            month: { $month: '$joinedAt' },
            day: { $dayOfMonth: '$joinedAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({ data: userGrowth });
  } catch (error) {
    console.error('User growth error:', error);
    res.status(500).json({ error: 'Failed to fetch user growth data' });
  }
});

async function generateInvestmentTrends(startDate, endDate) {
  const trends = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const monthInvestments = await Investment.find({
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });
    
    const monthVolume = monthInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    
    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      investments: monthInvestments.length,
      volume: monthVolume
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return trends.slice(-6);
}

module.exports = router;