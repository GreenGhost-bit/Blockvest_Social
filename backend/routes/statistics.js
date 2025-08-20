const express = require('express');
const router = express.Router();
const StatisticsService = require('../services/statisticsService');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { rateLimitAction } = require('../middleware/auth');

const statisticsService = new StatisticsService();

// Rate limiting for statistics endpoints
const statisticsRateLimit = rateLimitAction({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many statistics requests from this IP, please try again later.'
});

// Get platform-wide statistics (public)
router.get('/platform', statisticsRateLimit, async (req, res) => {
  try {
    const stats = await statisticsService.getPlatformStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics'
    });
  }
});

// Get user-specific statistics (authenticated)
router.get('/user', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const stats = await statisticsService.getUserStatistics(req.user.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

// Get investment statistics with filters (authenticated)
router.get('/investments', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined,
      category: req.query.category,
      dateRange: req.query.startDate && req.query.endDate ? {
        start: new Date(req.query.startDate),
        end: new Date(req.query.endDate)
      } : undefined
    };

    const stats = await statisticsService.getInvestmentStatistics(filters);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching investment statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investment statistics'
    });
  }
});

// Get reputation statistics (authenticated)
router.get('/reputation', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const stats = await statisticsService.getReputationStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching reputation statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reputation statistics'
    });
  }
});

// Get social statistics (authenticated)
router.get('/social', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const stats = await statisticsService.getSocialStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching social statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social statistics'
    });
  }
});

// Get comprehensive dashboard statistics (authenticated)
router.get('/dashboard', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const [userStats, investmentStats, reputationStats] = await Promise.all([
      statisticsService.getUserStatistics(req.user.id),
      statisticsService.getInvestmentStatistics(),
      statisticsService.getReputationStatistics()
    ]);

    const dashboardStats = {
      user: userStats,
      investments: investmentStats,
      reputation: reputationStats,
      summary: {
        totalInvestments: userStats.investments.total,
        activeInvestments: userStats.investments.active,
        totalEarnings: userStats.returns.totalRepayments,
        reputationLevel: userStats.reputation.level,
        socialConnections: userStats.social.connections
      }
    };

    res.json({
      success: true,
      data: dashboardStats
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get trend analysis (authenticated)
router.get('/trends', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const { period = '6months', type = 'investments' } = req.query;
    
    let trends;
    switch (type) {
      case 'investments':
        trends = await statisticsService.getMonthlyInvestmentTrends();
        break;
      case 'volume':
        trends = await statisticsService.getMonthlyVolume();
        break;
      case 'users':
        trends = await statisticsService.getUserGrowthStats();
        break;
      default:
        trends = await statisticsService.getMonthlyInvestmentTrends();
    }

    res.json({
      success: true,
      data: {
        type,
        period,
        trends
      }
    });
  } catch (error) {
    console.error('Error fetching trend analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend analysis'
    });
  }
});

// Get comparison statistics (authenticated)
router.get('/compare', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const { period1, period2, metric } = req.query;
    
    if (!period1 || !period2 || !metric) {
      return res.status(400).json({
        success: false,
        error: 'Periods and metric are required for comparison'
      });
    }

    const [stats1, stats2] = await Promise.all([
      statisticsService.getInvestmentStatistics({ dateRange: { start: new Date(period1), end: new Date(period2) } }),
      statisticsService.getInvestmentStatistics({ dateRange: { start: new Date(period2), end: new Date() } })
    ]);

    const comparison = {
      period1: { start: period1, end: period2, stats: stats1 },
      period2: { start: period2, end: 'now', stats: stats2 },
      changes: {
        volume: ((stats2.general.totalAmount - stats1.general.totalAmount) / stats1.general.totalAmount * 100).toFixed(2),
        count: ((stats2.general.count - stats1.general.count) / stats1.general.count * 100).toFixed(2),
        averageAmount: ((stats2.general.averageAmount - stats1.general.averageAmount) / stats1.general.averageAmount * 100).toFixed(2)
      }
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error fetching comparison statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comparison statistics'
    });
  }
});

// Get top performers (authenticated)
router.get('/top-performers', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const { category = 'reputation', limit = 10 } = req.query;
    
    let topPerformers;
    switch (category) {
      case 'reputation':
        topPerformers = await statisticsService.getTopReputationUsers(parseInt(limit));
        break;
      case 'influencers':
        topPerformers = await statisticsService.getTopInfluencers(parseInt(limit));
        break;
      case 'investors':
        topPerformers = await statisticsService.getTopInvestors(parseInt(limit));
        break;
      default:
        topPerformers = await statisticsService.getTopReputationUsers(parseInt(limit));
    }

    res.json({
      success: true,
      data: {
        category,
        limit: parseInt(limit),
        performers: topPerformers
      }
    });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top performers'
    });
  }
});

// Get risk analytics (authenticated)
router.get('/risk-analytics', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const { timeframe = '30days' } = req.query;
    
    const days = timeframe === '30days' ? 30 : timeframe === '90days' ? 90 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const riskStats = await statisticsService.getRiskAnalytics(startDate);
    
    res.json({
      success: true,
      data: {
        timeframe,
        startDate,
        analytics: riskStats
      }
    });
  } catch (error) {
    console.error('Error fetching risk analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risk analytics'
    });
  }
});

// Get performance metrics (authenticated)
router.get('/performance', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const { metric = 'roi', period = 'all' } = req.query;
    
    const performanceMetrics = await statisticsService.getPerformanceMetrics(metric, period);
    
    res.json({
      success: true,
      data: {
        metric,
        period,
        metrics: performanceMetrics
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics'
    });
  }
});

// Clear statistics cache (admin only)
router.post('/clear-cache', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    statisticsService.clearCache();
    res.json({
      success: true,
      message: 'Statistics cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing statistics cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear statistics cache'
    });
  }
});

// Get cache status (admin only)
router.get('/cache-status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const cacheSize = statisticsService.cache.size;
    const cacheKeys = Array.from(statisticsService.cache.keys());
    
    res.json({
      success: true,
      data: {
        cacheSize,
        cacheKeys,
        cacheTimeout: statisticsService.cacheTimeout
      }
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache status'
    });
  }
});

// Export statistics data (authenticated)
router.get('/export', authenticateToken, statisticsRateLimit, async (req, res) => {
  try {
    const { format = 'json', type = 'user' } = req.query;
    
    let data;
    switch (type) {
      case 'user':
        data = await statisticsService.getUserStatistics(req.user.id);
        break;
      case 'investments':
        data = await statisticsService.getInvestmentStatistics();
        break;
      case 'platform':
        data = await statisticsService.getPlatformStatistics();
        break;
      default:
        data = await statisticsService.getUserStatistics(req.user.id);
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_statistics.csv"`);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data,
        exportInfo: {
          type,
          format,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error exporting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export statistics'
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const csvContent = [
    headers.join(','),
    Object.values(flattened).map(value => 
      typeof value === 'string' ? `"${value}"` : value
    ).join(',')
  ].join('\n');

  return csvContent;
}

module.exports = router;
