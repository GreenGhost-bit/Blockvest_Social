const mongoose = require('mongoose');
const User = require('../models/user');
const Investment = require('../models/investment');

class StatisticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getPlatformStatistics() {
    const cacheKey = 'platform_stats';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [
        totalUsers,
        totalInvestments,
        activeInvestments,
        completedInvestments,
        defaultedInvestments,
        totalVolume,
        averageInterestRate,
        userGrowth,
        investmentGrowth
      ] = await Promise.all([
        User.countDocuments(),
        Investment.countDocuments(),
        Investment.countDocuments({ status: 'active' }),
        Investment.countDocuments({ status: 'completed' }),
        Investment.countDocuments({ status: 'defaulted' }),
        Investment.aggregate([
          { $match: { status: { $in: ['active', 'completed'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Investment.aggregate([
          { $match: { status: { $in: ['active', 'completed'] } } },
          { $group: { _id: null, avg: { $avg: '$interestRate' } } }
        ]),
        this.getUserGrowthStats(),
        this.getInvestmentGrowthStats()
      ]);

      const stats = {
        users: {
          total: totalUsers,
          growth: userGrowth,
          verified: await User.countDocuments({ verification_status: 'verified' }),
          active: await User.countDocuments({ last_active: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
        },
        investments: {
          total: totalInvestments,
          active: activeInvestments,
          completed: completedInvestments,
          defaulted: defaultedInvestments,
          successRate: totalInvestments > 0 ? ((completedInvestments / totalInvestments) * 100).toFixed(2) : 0,
          growth: investmentGrowth
        },
        volume: {
          total: totalVolume[0]?.total || 0,
          average: totalInvestments > 0 ? (totalVolume[0]?.total / totalInvestments).toFixed(2) : 0,
          monthly: await this.getMonthlyVolume()
        },
        performance: {
          averageInterestRate: averageInterestRate[0]?.avg || 0,
          averageRepaymentTime: await this.getAverageRepaymentTime(),
          defaultRate: totalInvestments > 0 ? ((defaultedInvestments / totalInvestments) * 100).toFixed(2) : 0
        },
        reputation: {
          averageScore: await this.getAverageReputationScore(),
          topUsers: await this.getTopReputationUsers(),
          levels: await this.getReputationLevelDistribution()
        },
        social: {
          totalConnections: await this.getTotalConnections(),
          averageFollowers: await this.getAverageFollowers(),
          activeCommunities: await this.getActiveCommunities()
        },
        lastUpdated: new Date()
      };

      this.setCachedData(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error getting platform statistics:', error);
      throw new Error('Failed to retrieve platform statistics');
    }
  }

  async getUserStatistics(userId) {
    const cacheKey = `user_stats_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const [
        totalInvested,
        totalBorrowed,
        activeInvestments,
        completedInvestments,
        defaultedInvestments,
        totalRepayments,
        averageReturn,
        reputationHistory
      ] = await Promise.all([
        Investment.aggregate([
          { $match: { investor: userId, status: { $in: ['active', 'completed'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Investment.aggregate([
          { $match: { borrower: userId, status: { $in: ['active', 'completed'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Investment.countDocuments({ investor: userId, status: 'active' }),
        Investment.countDocuments({ investor: userId, status: 'completed' }),
        Investment.countDocuments({ investor: userId, status: 'defaulted' }),
        Investment.aggregate([
          { $match: { investor: userId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$repaymentAmount' } } }
        ]),
        Investment.aggregate([
          { $match: { investor: userId, status: 'completed' } },
          { $group: { _id: null, avg: { $avg: '$interestRate' } } }
        ]),
        this.getUserReputationHistory(userId)
      ]);

      const stats = {
        overview: {
          totalInvested: totalInvested[0]?.total || 0,
          totalBorrowed: totalBorrowed[0]?.total || 0,
          netWorth: (totalInvested[0]?.total || 0) - (totalBorrowed[0]?.total || 0)
        },
        investments: {
          active: activeInvestments,
          completed: completedInvestments,
          defaulted: defaultedInvestments,
          total: activeInvestments + completedInvestments + defaultedInvestments,
          successRate: (activeInvestments + completedInvestments + defaultedInvestments) > 0 ? 
            ((completedInvestments / (activeInvestments + completedInvestments + defaultedInvestments)) * 100).toFixed(2) : 0
        },
        returns: {
          totalRepayments: totalRepayments[0]?.total || 0,
          averageReturn: averageReturn[0]?.avg || 0,
          roi: totalInvested[0]?.total > 0 ? 
            (((totalRepayments[0]?.total || 0) - (totalInvested[0]?.total || 0)) / (totalInvested[0]?.total || 0) * 100).toFixed(2) : 0
        },
        reputation: {
          currentScore: user.reputation_score,
          level: user.reputation_level,
          history: reputationHistory,
          factors: user.risk_factors || {}
        },
        social: {
          followers: user.followers?.length || 0,
          following: user.following?.length || 0,
          connections: user.connections?.length || 0,
          socialScore: user.social_score || 0
        },
        activity: {
          lastActive: user.last_active,
          loginCount: user.login_count,
          badges: user.badges || [],
          verificationStatus: user.verification_status
        },
        lastUpdated: new Date()
      };

      this.setCachedData(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw new Error('Failed to retrieve user statistics');
    }
  }

  async getInvestmentStatistics(filters = {}) {
    const cacheKey = `investment_stats_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const matchStage = {};
      if (filters.status) matchStage.status = filters.status;
      if (filters.minAmount) matchStage.amount = { $gte: filters.minAmount };
      if (filters.maxAmount) matchStage.amount = { ...matchStage.amount, $lte: filters.maxAmount };
      if (filters.category) matchStage.category = filters.category;
      if (filters.dateRange) {
        matchStage.createdAt = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' },
            averageInterestRate: { $avg: '$interestRate' },
            averageDuration: { $avg: '$duration' },
            minAmount: { $min: '$amount' },
            maxAmount: { $max: '$amount' }
          }
        }
      ];

      const [generalStats, statusDistribution, categoryDistribution, monthlyTrends] = await Promise.all([
        Investment.aggregate(pipeline),
        Investment.aggregate([
          { $match: matchStage },
          { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]),
        Investment.aggregate([
          { $match: matchStage },
          { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]),
        this.getMonthlyInvestmentTrends(filters)
      ]);

      const stats = {
        general: generalStats[0] || {
          count: 0,
          totalAmount: 0,
          averageAmount: 0,
          averageInterestRate: 0,
          averageDuration: 0,
          minAmount: 0,
          maxAmount: 0
        },
        distribution: {
          byStatus: statusDistribution,
          byCategory: categoryDistribution
        },
        trends: monthlyTrends,
        lastUpdated: new Date()
      };

      this.setCachedData(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error getting investment statistics:', error);
      throw new Error('Failed to retrieve investment statistics');
    }
  }

  async getReputationStatistics() {
    const cacheKey = 'reputation_stats';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [
        averageScore,
        levelDistribution,
        topUsers,
        scoreRanges,
        improvementRates
      ] = await Promise.all([
        User.aggregate([
          { $group: { _id: null, avg: { $avg: '$reputation_score' } } }
        ]),
        User.aggregate([
          { $group: { _id: '$reputation_level', count: { $sum: 1 } } }
        ]),
        User.find({}, 'username reputation_score reputation_level')
          .sort({ reputation_score: -1 })
          .limit(10),
        User.aggregate([
          {
            $bucket: {
              groupBy: '$reputation_score',
              boundaries: [0, 200, 400, 600, 800, 1000],
              default: '1000+',
              output: { count: { $sum: 1 } }
            }
          }
        ]),
        this.getReputationImprovementRates()
      ]);

      const stats = {
        overview: {
          averageScore: averageScore[0]?.avg || 0,
          totalUsers: await User.countDocuments()
        },
        distribution: {
          byLevel: levelDistribution,
          byScoreRange: scoreRanges
        },
        topUsers: topUsers.map(user => ({
          username: user.username,
          score: user.reputation_score,
          level: user.reputation_level
        })),
        improvement: improvementRates,
        lastUpdated: new Date()
      };

      this.setCachedData(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error getting reputation statistics:', error);
      throw new Error('Failed to retrieve reputation statistics');
    }
  }

  async getSocialStatistics() {
    const cacheKey = 'social_stats';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [
        totalConnections,
        averageFollowers,
        activeCommunities,
        engagementMetrics,
        topInfluencers
      ] = await Promise.all([
        this.getTotalConnections(),
        this.getAverageFollowers(),
        this.getActiveCommunities(),
        this.getEngagementMetrics(),
        this.getTopInfluencers()
      ]);

      const stats = {
        connections: {
          total: totalConnections,
          average: averageFollowers,
          distribution: await this.getConnectionDistribution()
        },
        communities: {
          active: activeCommunities,
          engagement: engagementMetrics
        },
        influencers: topInfluencers,
        lastUpdated: new Date()
      };

      this.setCachedData(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error getting social statistics:', error);
      throw new Error('Failed to retrieve social statistics');
    }
  }

  // Helper methods
  async getUserGrowthStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const totalUsers = await User.countDocuments();
    return totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0;
  }

  async getInvestmentGrowthStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newInvestments = await Investment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const totalInvestments = await Investment.countDocuments();
    return totalInvestments > 0 ? ((newInvestments / totalInvestments) * 100).toFixed(2) : 0;
  }

  async getMonthlyVolume() {
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    return Investment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: ['active', 'completed'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  async getAverageRepaymentTime() {
    const completedInvestments = await Investment.find({ status: 'completed' });
    if (completedInvestments.length === 0) return 0;

    const totalDays = completedInvestments.reduce((sum, inv) => {
      const fundedDate = new Date(inv.fundedAt);
      const completedDate = new Date(inv.completedAt);
      return sum + Math.ceil((completedDate - fundedDate) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / completedInvestments.length);
  }

  async getAverageReputationScore() {
    const result = await User.aggregate([
      { $group: { _id: null, avg: { $avg: '$reputation_score' } } }
    ]);
    return result[0]?.avg || 0;
  }

  async getTopReputationUsers(limit = 10) {
    return User.find({}, 'username reputation_score reputation_level')
      .sort({ reputation_score: -1 })
      .limit(limit);
  }

  async getReputationLevelDistribution() {
    return User.aggregate([
      { $group: { _id: '$reputation_level', count: { $sum: 1 } } }
    ]);
  }

  async getTotalConnections() {
    const users = await User.find({}, 'connections');
    return users.reduce((total, user) => total + (user.connections?.length || 0), 0);
  }

  async getAverageFollowers() {
    const users = await User.find({}, 'followers');
    const totalFollowers = users.reduce((total, user) => total + (user.followers?.length || 0), 0);
    return users.length > 0 ? Math.round(totalFollowers / users.length) : 0;
  }

  async getActiveCommunities() {
    const users = await User.find({}, 'connections followers');
    const communities = new Set();
    
    users.forEach(user => {
      if (user.connections?.length > 0 || user.followers?.length > 0) {
        communities.add(user._id.toString());
      }
    });

    return communities.size;
  }

  async getUserReputationHistory(userId) {
    const user = await User.findById(userId);
    return user?.reputation_history || [];
  }

  async getMonthlyInvestmentTrends(filters = {}) {
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const matchStage = { createdAt: { $gte: sixMonthsAgo } };
    
    if (filters.status) matchStage.status = filters.status;
    if (filters.category) matchStage.category = filters.category;

    return Investment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  async getReputationImprovementRates() {
    const users = await User.find({}, 'reputation_history');
    const improvements = users.filter(user => 
      user.reputation_history && user.reputation_history.length > 1
    );

    if (improvements.length === 0) return 0;

    const improvementCount = improvements.filter(user => {
      const history = user.reputation_history;
      return history[history.length - 1].score > history[0].score;
    }).length;

    return ((improvementCount / improvements.length) * 100).toFixed(2);
  }

  async getConnectionDistribution() {
    const users = await User.find({}, 'connections');
    const distribution = {};

    users.forEach(user => {
      const connectionCount = user.connections?.length || 0;
      distribution[connectionCount] = (distribution[connectionCount] || 0) + 1;
    });

    return distribution;
  }

  async getEngagementMetrics() {
    const users = await User.find({}, 'followers following connections');
    
    const metrics = {
      averageFollowers: 0,
      averageFollowing: 0,
      averageConnections: 0,
      engagementRate: 0
    };

    if (users.length > 0) {
      const totalFollowers = users.reduce((sum, user) => sum + (user.followers?.length || 0), 0);
      const totalFollowing = users.reduce((sum, user) => sum + (user.following?.length || 0), 0);
      const totalConnections = users.reduce((sum, user) => sum + (user.connections?.length || 0), 0);

      metrics.averageFollowers = Math.round(totalFollowers / users.length);
      metrics.averageFollowing = Math.round(totalFollowing / users.length);
      metrics.averageConnections = Math.round(totalConnections / users.length);
      metrics.engagementRate = totalFollowers > 0 ? ((totalConnections / totalFollowers) * 100).toFixed(2) : 0;
    }

    return metrics;
  }

  async getTopInfluencers(limit = 10) {
    return User.find({}, 'username followers reputation_score')
      .sort({ followers: -1, reputation_score: -1 })
      .limit(limit)
      .map(user => ({
        username: user.username,
        followers: user.followers?.length || 0,
        reputationScore: user.reputation_score
      }));
  }

  // Cache management
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

  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = StatisticsService;
