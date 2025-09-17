'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';

interface ReputationData {
  overallScore: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  totalInvestments: number;
  successfulInvestments: number;
  totalAmountInvested: number;
  totalAmountRepaid: number;
  onTimeRepayments: number;
  lateRepayments: number;
  defaultedInvestments: number;
  socialScore: number;
  verificationScore: number;
  history: Array<{
    id: string;
    type: 'investment' | 'repayment' | 'verification' | 'social';
    description: string;
    scoreChange: number;
    timestamp: string;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  nextMilestones: Array<{
    requirement: string;
    reward: string;
    progress: number;
  }>;
}

const ReputationPage: React.FC = () => {
  const { isConnected } = useWallet();
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements'>('overview');

  useEffect(() => {
    if (isConnected) {
      fetchReputationData();
    }
  }, [isConnected]);

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      // Mock reputation data - replace with actual API call
      const mockData: ReputationData = {
        overallScore: 85,
        level: 'gold',
        totalInvestments: 12,
        successfulInvestments: 10,
        totalAmountInvested: 25000,
        totalAmountRepaid: 18000,
        onTimeRepayments: 8,
        lateRepayments: 2,
        defaultedInvestments: 0,
        socialScore: 90,
        verificationScore: 95,
        history: [
          {
            id: '1',
            type: 'investment',
            description: 'Successfully completed investment with Alice Johnson',
            scoreChange: +5,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            type: 'repayment',
            description: 'On-time repayment of $1,200',
            scoreChange: +3,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            type: 'verification',
            description: 'Completed identity verification',
            scoreChange: +10,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            type: 'social',
            description: 'Received positive feedback from borrower',
            scoreChange: +2,
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '5',
            type: 'investment',
            description: 'Successfully completed investment with Bob Smith',
            scoreChange: +5,
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        achievements: [
          {
            id: '1',
            name: 'First Investment',
            description: 'Completed your first investment',
            icon: '🎯',
            unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            name: 'Trusted Investor',
            description: 'Maintained 90%+ success rate for 10+ investments',
            icon: '⭐',
            unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            name: 'Verification Master',
            description: 'Completed all verification requirements',
            icon: '🔒',
            unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            name: 'Social Butterfly',
            description: 'Received 10+ positive social feedbacks',
            icon: '🦋',
            unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        nextMilestones: [
          {
            requirement: 'Complete 15 total investments',
            reward: 'Platinum Level',
            progress: 80
          },
          {
            requirement: 'Maintain 95%+ success rate',
            reward: 'Perfect Investor Badge',
            progress: 90
          },
          {
            requirement: 'Invest $50,000+ total',
            reward: 'High Roller Status',
            progress: 50
          }
        ]
      };
      
      setReputationData(mockData);
    } catch (error) {
      console.error('Failed to fetch reputation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze':
        return 'text-orange-600 bg-orange-100';
      case 'silver':
        return 'text-gray-600 bg-gray-100';
      case 'gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'platinum':
        return 'text-blue-600 bg-blue-100';
      case 'diamond':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      case 'diamond':
        return '💠';
      default:
        return '⭐';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to view your reputation.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reputation data...</p>
        </div>
      </div>
    );
  }

  if (!reputationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Reputation Data</h1>
          <p className="text-gray-600">Start investing to build your reputation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reputation & Social Score</h1>
          <p className="text-gray-600 mt-2">Track your investment performance and social standing</p>
        </div>

        {/* Reputation Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{getLevelIcon(reputationData.level)}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {reputationData.level.charAt(0).toUpperCase() + reputationData.level.slice(1)} Level
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">{reputationData.overallScore}</span>
                  <span className="text-gray-500">/ 100</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Overall Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(reputationData.overallScore)}`}>
                {reputationData.overallScore}/100
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reputationData.socialScore}</div>
              <div className="text-sm text-gray-500">Social Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reputationData.verificationScore}</div>
              <div className="text-sm text-gray-500">Verification Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((reputationData.successfulInvestments / reputationData.totalInvestments) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'history', label: 'History' },
              { key: 'achievements', label: 'Achievements' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Investment Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{reputationData.totalInvestments}</div>
                  <div className="text-sm text-gray-500">Total Investments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reputationData.successfulInvestments}</div>
                  <div className="text-sm text-gray-500">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(reputationData.totalAmountInvested)}</div>
                  <div className="text-sm text-gray-500">Total Invested</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(reputationData.totalAmountRepaid)}</div>
                  <div className="text-sm text-gray-500">Total Repaid</div>
                </div>
              </div>
            </div>

            {/* Repayment History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Repayment History</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reputationData.onTimeRepayments}</div>
                  <div className="text-sm text-gray-500">On Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{reputationData.lateRepayments}</div>
                  <div className="text-sm text-gray-500">Late</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{reputationData.defaultedInvestments}</div>
                  <div className="text-sm text-gray-500">Defaulted</div>
                </div>
              </div>
            </div>

            {/* Next Milestones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Milestones</h3>
              <div className="space-y-4">
                {reputationData.nextMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{milestone.requirement}</h4>
                      <p className="text-sm text-gray-500">{milestone.reward}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{milestone.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation History</h3>
            <div className="space-y-4">
              {reputationData.history.map((event) => (
                <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.scoreChange > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className={`text-sm font-bold ${
                        event.scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.scoreChange > 0 ? '+' : ''}{event.scoreChange}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{event.description}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reputationData.achievements.map((achievement) => (
                <div key={achievement.id} className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-gray-900 mb-1">{achievement.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                  <p className="text-xs text-gray-400">
                    Unlocked {formatDate(achievement.unlockedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReputationPage;