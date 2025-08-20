const User = require('../models/User');
const Investment = require('../models/Investment');

class ReputationService {
  constructor() {
    this.reputationLevels = {
      bronze: { min: 0, max: 299, multiplier: 1.0 },
      silver: { min: 300, max: 699, multiplier: 1.2 },
      gold: { min: 700, max: 1199, multiplier: 1.5 },
      platinum: { min: 1200, max: 1999, multiplier: 2.0 },
      diamond: { min: 2000, max: 3499, multiplier: 2.5 },
      master: { min: 3500, max: 9999, multiplier: 3.0 },
      legend: { min: 10000, max: Infinity, multiplier: 4.0 }
    };

    this.reputationFactors = {
      successfulInvestments: { weight: 25, maxPoints: 1000 },
      onTimeRepayments: { weight: 20, maxPoints: 800 },
      socialConnections: { weight: 15, maxPoints: 600 },
      verificationStatus: { weight: 15, maxPoints: 600 },
      communityEngagement: { weight: 10, maxPoints: 400 },
      accountAge: { weight: 8, maxPoints: 320 },
      profileCompleteness: { weight: 7, maxPoints: 280 }
    };
  }

  async calculateReputationScore(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let totalScore = 0;
      const factorScores = {};

      // Calculate factor scores
      const [
        investmentScore,
        socialScore,
        verificationScore,
        engagementScore,
        ageScore,
        profileScore
      ] = await Promise.all([
        this.calculateInvestmentScore(user),
        this.calculateSocialScore(user),
        this.calculateVerificationScore(user),
        this.calculateEngagementScore(user),
        this.calculateAgeScore(user),
        this.calculateProfileScore(user)
      ]);

      // Apply weights and sum up
      totalScore += investmentScore * (this.reputationFactors.successfulInvestments.weight / 100);
      totalScore += socialScore * (this.reputationFactors.socialConnections.weight / 100);
      totalScore += verificationScore * (this.reputationFactors.verificationStatus.weight / 100);
      totalScore += engagementScore * (this.reputationFactors.communityEngagement.weight / 100);
      totalScore += ageScore * (this.reputationFactors.accountAge.weight / 100);
      totalScore += profileScore * (this.reputationFactors.profileCompleteness.weight / 100);

      // Normalize to 0-10000 range
      totalScore = Math.min(Math.max(Math.round(totalScore), 0), 10000);

      // Determine reputation level
      const reputationLevel = this.getReputationLevel(totalScore);

      // Update user reputation
      await this.updateUserReputation(userId, totalScore, reputationLevel, factorScores);

      return {
        score: totalScore,
        level: reputationLevel,
        factorScores: {
          investment: investmentScore,
          social: socialScore,
          verification: verificationScore,
          engagement: engagementScore,
          age: ageScore,
          profile: profileScore
        }
      };
    } catch (error) {
      console.error('Error calculating reputation score:', error);
      throw error;
    }
  }

  async calculateInvestmentScore(user) {
    try {
      const investments = await Investment.find({
        $or: [
          { borrower_id: user._id },
          { investor_id: user._id }
        ]
      });

      let score = 0;
      const borrowerInvestments = investments.filter(inv => inv.borrower_id.equals(user._id));
      const investorInvestments = investments.filter(inv => inv.investor_id.equals(user._id));

      // Borrower score
      const successfulBorrows = borrowerInvestments.filter(inv => inv.status === 'completed');
      const defaultedBorrows = borrowerInvestments.filter(inv => inv.status === 'defaulted');
      
      score += successfulBorrows.length * 50;
      score -= defaultedBorrows.length * 100;

      // Investor score
      const successfulInvests = investorInvestments.filter(inv => inv.status === 'completed');
      score += successfulInvests.length * 30;

      // On-time repayment bonus
      const onTimeRepayments = borrowerInvestments.filter(inv => 
        inv.status === 'completed' && 
        inv.repayment_schedule && 
        inv.repayment_schedule.every(repayment => 
          repayment.status === 'completed' && 
          new Date(repayment.due_date) >= new Date(repayment.paid_date)
        )
      );
      score += onTimeRepayments.length * 25;

      return Math.min(Math.max(score, 0), this.reputationFactors.successfulInvestments.maxPoints);
    } catch (error) {
      console.error('Error calculating investment score:', error);
      return 0;
    }
  }

  async calculateSocialScore(user) {
    try {
      let score = 0;

      // Followers and following
      score += Math.min(user.followers?.length || 0, 100) * 2;
      score += Math.min(user.following?.length || 0, 50) * 1;

      // Connections
      const strongConnections = user.connections?.filter(conn => conn.strength >= 0.8) || [];
      const mediumConnections = user.connections?.filter(conn => conn.strength >= 0.5 && conn.strength < 0.8) || [];
      
      score += strongConnections.length * 10;
      score += mediumConnections.length * 5;

      // Social links
      const socialLinksCount = Object.keys(user.social_links || {}).length;
      score += Math.min(socialLinksCount, 5) * 20;

      return Math.min(Math.max(score, 0), this.reputationFactors.socialConnections.maxPoints);
    } catch (error) {
      console.error('Error calculating social score:', error);
      return 0;
    }
  }

  async calculateVerificationScore(user) {
    try {
      let score = 0;

      // Basic verification
      if (user.verification_status === 'verified') {
        score += 300;
      } else if (user.verification_status === 'pending') {
        score += 150;
      }

      // Document verification
      const verifiedDocs = user.verification_documents?.filter(doc => doc.status === 'verified') || [];
      score += verifiedDocs.length * 50;

      // KYC level
      if (user.kyc_level === 'basic') score += 100;
      else if (user.kyc_level === 'enhanced') score += 200;
      else if (user.kyc_level === 'premium') score += 300;

      // Email and phone verification
      if (user.email_verified) score += 50;
      if (user.phone_verified) score += 50;

      return Math.min(Math.max(score, 0), this.reputationFactors.verificationStatus.maxPoints);
    } catch (error) {
      console.error('Error calculating verification score:', error);
      return 0;
    }
  }

  async calculateEngagementScore(user) {
    try {
      let score = 0;

      // Login activity
      score += Math.min(user.login_count || 0, 100) * 2;

      // Last active
      const daysSinceLastActive = Math.floor((Date.now() - (user.last_active || Date.now())) / (1000 * 60 * 60 * 24));
      if (daysSinceLastActive <= 7) score += 100;
      else if (daysSinceLastActive <= 30) score += 50;
      else if (daysSinceLastActive <= 90) score += 25;

      // Profile completeness
      const profileFields = ['bio', 'location', 'occupation', 'education', 'skills'];
      const completedFields = profileFields.filter(field => user[field] && user[field].trim() !== '');
      score += (completedFields.length / profileFields.length) * 200;

      // Badges
      score += (user.badges?.length || 0) * 30;

      return Math.min(Math.max(score, 0), this.reputationFactors.communityEngagement.maxPoints);
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return 0;
    }
  }

  async calculateAgeScore(user) {
    try {
      const accountAge = Date.now() - new Date(user.created_at).getTime();
      const daysOld = Math.floor(accountAge / (1000 * 60 * 60 * 24));
      
      let score = 0;
      
      if (daysOld >= 365) score = 320;
      else if (daysOld >= 180) score = 240;
      else if (daysOld >= 90) score = 160;
      else if (daysOld >= 30) score = 80;
      else if (daysOld >= 7) score = 40;
      else score = 20;

      return Math.min(Math.max(score, 0), this.reputationFactors.accountAge.maxPoints);
    } catch (error) {
      console.error('Error calculating age score:', error);
      return 0;
    }
  }

  async calculateProfileScore(user) {
    try {
      let score = 0;
      const requiredFields = [
        'first_name', 'last_name', 'email', 'bio', 'location', 
        'occupation', 'education', 'skills', 'profile_picture'
      ];

      const completedFields = requiredFields.filter(field => {
        const value = user[field];
        return value && (typeof value === 'string' ? value.trim() !== '' : true);
      });

      score = (completedFields.length / requiredFields.length) * 280;

      return Math.min(Math.max(score, 0), this.reputationFactors.profileCompleteness.maxPoints);
    } catch (error) {
      console.error('Error calculating profile score:', error);
      return 0;
    }
  }

  getReputationLevel(score) {
    for (const [level, range] of Object.entries(this.reputationLevels)) {
      if (score >= range.min && score <= range.max) {
        return level;
      }
    }
    return 'bronze';
  }

  async updateUserReputation(userId, score, level, factorScores) {
    try {
      const updateData = {
        reputation_score: score,
        reputation_level: level,
        reputation_updated_at: new Date(),
        'reputation_history': {
          score,
          level,
          factor_scores: factorScores,
          updated_at: new Date()
        }
      };

      await User.findByIdAndUpdate(userId, {
        $set: updateData,
        $push: { reputation_history: updateData.reputation_history }
      });

      return true;
    } catch (error) {
      console.error('Error updating user reputation:', error);
      throw error;
    }
  }

  async getReputationLeaderboard(limit = 50) {
    try {
      const users = await User.find({ reputation_score: { $exists: true } })
        .select('first_name last_name reputation_score reputation_level profile_picture')
        .sort({ reputation_score: -1 })
        .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        name: `${user.first_name} ${user.last_name}`,
        score: user.reputation_score,
        level: user.reputation_level,
        profilePicture: user.profile_picture
      }));
    } catch (error) {
      console.error('Error getting reputation leaderboard:', error);
      throw error;
    }
  }

  async getReputationDistribution() {
    try {
      const distribution = await User.aggregate([
        {
          $match: { reputation_score: { $exists: true } }
        },
        {
          $group: {
            _id: '$reputation_level',
            count: { $sum: 1 },
            avgScore: { $avg: '$reputation_score' }
          }
        },
        {
          $sort: { avgScore: -1 }
        }
      ]);

      return distribution.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          avgScore: Math.round(item.avgScore * 100) / 100
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting reputation distribution:', error);
      throw error;
    }
  }

  async calculateReputationMultiplier(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.reputation_level) {
        return 1.0;
      }

      const level = this.reputationLevels[user.reputation_level];
      return level ? level.multiplier : 1.0;
    } catch (error) {
      console.error('Error calculating reputation multiplier:', error);
      return 1.0;
    }
  }

  async awardReputationPoints(userId, points, reason) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const currentScore = user.reputation_score || 0;
      const newScore = Math.max(0, currentScore + points);
      const newLevel = this.getReputationLevel(newScore);

      await this.updateUserReputation(userId, newScore, newLevel, {});

      return {
        previousScore: currentScore,
        newScore,
        previousLevel: user.reputation_level,
        newLevel,
        pointsAwarded: points,
        reason
      };
    } catch (error) {
      console.error('Error awarding reputation points:', error);
      throw error;
    }
  }

  async getReputationHistory(userId, limit = 20) {
    try {
      const user = await User.findById(userId)
        .select('reputation_history')
        .slice('reputation_history', -limit);

      return user?.reputation_history || [];
    } catch (error) {
      console.error('Error getting reputation history:', error);
      throw error;
    }
  }
}

module.exports = ReputationService;
