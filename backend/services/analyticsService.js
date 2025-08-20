const User = require('../models/User');
const Investment = require('../models/Investment');

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get platform overview statistics
  async getPlatformOverview() {
    try {
      const cacheKey = 'platform_overview';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const [
        totalUsers,
        totalInvestments,
        totalVolume,
        activeInvestments,
        completedInvestments,
        defaultedInvestments
      ] = await Promise.all([
        User.countDocuments(),
        Investment.countDocuments(),
        Investment.aggregate([
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Investment.countDocuments({ status: 'active' }),
        Investment.countDocuments({ status: 'completed' }),
        Investment.countDocuments({ status: 'defaulted' })
      ]);

      const overview = {
        totalUsers,
        totalInvestments,
        totalVolume: totalVolume[0]?.total || 0,
        activeInvestments,
        completedInvestments,
        defaultedInvestments,
        successRate: totalInvestments > 0 ? 
          ((completedInvestments / totalInvestments) * 100).toFixed(2) : 0,
        defaultRate: totalInvestments > 0 ? 
          ((defaultedInvestments / totalInvestments) * 100).toFixed(2) : 0
      };

      this.setCachedData(cacheKey, overview);
      return overview;
    } catch (error) {
      console.error('Error getting platform overview:', error);
      throw error;
    }
  }

  // Get user growth analytics
  async getUserGrowthAnalytics(days = 30) {
    try {
      const cacheKey = `user_growth_${days}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const userGrowth = await User.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
              day: { $dayOfMonth: '$created_at' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      const analytics = {
        period: days,
        totalNewUsers: userGrowth.reduce((sum, item) => sum + item.count, 0),
        dailyGrowth: userGrowth.map(item => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          newUsers: item.count
        })),
        averageDailyGrowth: userGrowth.length > 0 ? 
          (userGrowth.reduce((sum, item) => sum + item.count, 0) / userGrowth.length).toFixed(2) : 0
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting user growth analytics:', error);
      throw error;
    }
  }

  // Get investment performance analytics
  async getInvestmentPerformanceAnalytics() {
    try {
      const cacheKey = 'investment_performance';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const performance = await Investment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
            avgInterestRate: { $avg: '$interest_rate' },
            avgDuration: { $avg: '$duration' }
          }
        }
      ]);

      const analytics = {
        byStatus: performance.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount,
            avgAmount: Math.round(item.avgAmount * 100) / 100,
            avgInterestRate: Math.round(item.avgInterestRate * 100) / 100,
            avgDuration: Math.round(item.avgDuration * 100) / 100
          };
          return acc;
        }, {}),
        totalInvestments: performance.reduce((sum, item) => sum + item.count, 0),
        totalVolume: performance.reduce((sum, item) => sum + item.totalAmount, 0)
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting investment performance analytics:', error);
      throw error;
    }
  }

  // Get risk analytics
  async getRiskAnalytics() {
    try {
      const cacheKey = 'risk_analytics';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const riskData = await User.aggregate([
        {
          $match: { risk_score: { $exists: true, $ne: null } }
        },
        {
          $group: {
            _id: {
              riskLevel: {
                $switch: {
                  branches: [
                    { case: { $gte: ['$risk_score', 80] }, then: 'low' },
                    { case: { $gte: ['$risk_score', 60] }, then: 'medium' },
                    { case: { $gte: ['$risk_score', 40] }, then: 'high' }
                  ],
                  default: 'very_high'
                }
              }
            },
            count: { $sum: 1 },
            avgScore: { $avg: '$risk_score' },
            avgReputation: { $avg: '$reputation_score' }
          }
        },
        {
          $sort: { '_id.riskLevel': 1 }
        }
      ]);

      const analytics = {
        riskDistribution: riskData.reduce((acc, item) => {
          acc[item._id.riskLevel] = {
            count: item.count,
            avgScore: Math.round(item.avgScore * 100) / 100,
            avgReputation: Math.round(item.avgReputation * 100) / 100
          };
          return acc;
        }, {}),
        totalAssessedUsers: riskData.reduce((sum, item) => sum + item.count, 0)
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting risk analytics:', error);
      throw error;
    }
  }

  // Get social network analytics
  async getSocialNetworkAnalytics() {
    try {
      const cacheKey = 'social_network_analytics';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const socialData = await User.aggregate([
        {
          $project: {
            followersCount: { $size: '$followers' },
            followingCount: { $size: '$following' },
            connectionsCount: { $size: '$connections' },
            reputationScore: '$reputation_score',
            reputationLevel: '$reputation_level'
          }
        },
        {
          $group: {
            _id: null,
            avgFollowers: { $avg: '$followersCount' },
            avgFollowing: { $avg: '$followingCount' },
            avgConnections: { $avg: '$connectionsCount' },
            avgReputation: { $avg: '$reputationScore' },
            totalUsers: { $sum: 1 }
          }
        }
      ]);

      const reputationDistribution = await User.aggregate([
        {
          $group: {
            _id: '$reputation_level',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      const analytics = {
        networkMetrics: socialData[0] ? {
          avgFollowers: Math.round(socialData[0].avgFollowers * 100) / 100,
          avgFollowing: Math.round(socialData[0].avgFollowing * 100) / 100,
          avgConnections: Math.round(socialData[0].avgConnections * 100) / 100,
          avgReputation: Math.round(socialData[0].avgReputation * 100) / 100,
          totalUsers: socialData[0].totalUsers
        } : {},
        reputationDistribution: reputationDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting social network analytics:', error);
      throw error;
    }
  }

  // Get geographic analytics
  async getGeographicAnalytics() {
    try {
      const cacheKey = 'geographic_analytics';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const geographicData = await User.aggregate([
        {
          $match: { location: { $exists: true, $ne: '' } }
        },
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 },
            avgRiskScore: { $avg: '$risk_score' },
            avgReputation: { $avg: '$reputation_score' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 20
        }
      ]);

      const analytics = {
        topLocations: geographicData.map(item => ({
          location: item._id,
          userCount: item.count,
          avgRiskScore: Math.round(item.avgRiskScore * 100) / 100,
          avgReputation: Math.round(item.avgReputation * 100) / 100
        })),
        totalLocations: geographicData.length
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting geographic analytics:', error);
      throw error;
    }
  }

  // Get investment trends over time
  async getInvestmentTrends(days = 90) {
    try {
      const cacheKey = `investment_trends_${days}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const trends = await Investment.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
              day: { $dayOfMonth: '$created_at' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgInterestRate: { $avg: '$interest_rate' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      const analytics = {
        period: days,
        dailyTrends: trends.map(item => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          newInvestments: item.count,
          totalAmount: item.totalAmount,
          avgInterestRate: Math.round(item.avgInterestRate * 100) / 100
        })),
        totalNewInvestments: trends.reduce((sum, item) => sum + item.count, 0),
        totalVolume: trends.reduce((sum, item) => sum + item.totalAmount, 0)
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting investment trends:', error);
      throw error;
    }
  }

  // Cache management methods
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Generate comprehensive report
  async generateComprehensiveReport() {
    try {
      const [
        overview,
        userGrowth,
        performance,
        risk,
        social,
        geographic,
        trends
      ] = await Promise.all([
        this.getPlatformOverview(),
        this.getUserGrowthAnalytics(30),
        this.getInvestmentPerformanceAnalytics(),
        this.getRiskAnalytics(),
        this.getSocialNetworkAnalytics(),
        this.getGeographicAnalytics(),
        this.getInvestmentTrends(90)
      ]);

      return {
        generatedAt: new Date(),
        overview,
        userGrowth,
        performance,
        risk,
        social,
        geographic,
        trends,
        summary: {
          totalUsers: overview.totalUsers,
          totalInvestments: overview.totalInvestments,
          totalVolume: overview.totalVolume,
          successRate: overview.successRate,
          defaultRate: overview.defaultRate
        }
      };
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
