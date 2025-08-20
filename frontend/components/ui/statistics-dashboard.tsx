'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';

interface StatisticsData {
  users: {
    total: number;
    growth: string;
    verified: number;
    active: number;
  };
  investments: {
    total: number;
    active: number;
    completed: number;
    defaulted: number;
    successRate: string;
    growth: string;
  };
  volume: {
    total: number;
    average: string;
    monthly: Array<{
      _id: string;
      total: number;
      count: number;
    }>;
  };
  performance: {
    averageInterestRate: number;
    averageRepaymentTime: number;
    defaultRate: string;
  };
  reputation: {
    averageScore: number;
    topUsers: Array<{
      username: string;
      score: number;
      level: string;
    }>;
    levels: Array<{
      _id: string;
      count: number;
    }>;
  };
  social: {
    totalConnections: number;
    averageFollowers: number;
    activeCommunities: number;
  };
  lastUpdated: string;
}

interface UserStatistics {
  overview: {
    totalInvested: number;
    totalBorrowed: number;
    netWorth: number;
  };
  investments: {
    active: number;
    completed: number;
    defaulted: number;
    total: number;
    successRate: string;
  };
  returns: {
    totalRepayments: number;
    averageReturn: number;
    roi: string;
  };
  reputation: {
    currentScore: number;
    level: string;
    history: Array<{
      score: number;
      date: string;
      reason: string;
    }>;
  };
  social: {
    followers: number;
    following: number;
    connections: number;
    socialScore: number;
  };
}

const StatisticsDashboard: React.FC = () => {
  const [platformStats, setPlatformStats] = useState<StatisticsData | null>(null);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'platform' | 'user' | 'trends'>('platform');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [activeTab, timeRange]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === 'platform') {
        const response = await fetch('/api/statistics/platform');
        if (response.ok) {
          const data = await response.json();
          setPlatformStats(data.data);
        } else {
          throw new Error('Failed to fetch platform statistics');
        }
      } else if (activeTab === 'user') {
        const response = await fetch('/api/statistics/user');
        if (response.ok) {
          const data = await response.json();
          setUserStats(data.data);
        } else {
          throw new Error('Failed to fetch user statistics');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: string) => {
    const num = parseFloat(growth);
    return num >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: string) => {
    const num = parseFloat(growth);
    return num >= 0 ? ArrowUpIcon : ArrowDownIcon;
  };

  const getReputationColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'text-purple-600';
      case 'good': return 'text-green-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <ChartBarIcon className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Statistics
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchStatistics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Statistics Dashboard
          </h2>
          <p className="text-gray-600">
            Comprehensive analytics and insights for the platform
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        {[
          { id: 'platform', label: 'Platform Overview', icon: ChartBarIcon },
          { id: 'user', label: 'User Analytics', icon: UsersIcon },
          { id: 'trends', label: 'Trends', icon: TrendingUpIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Platform Overview Tab */}
      {activeTab === 'platform' && platformStats && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{formatNumber(platformStats.users.total)}</p>
                  <div className="flex items-center mt-2">
                    {React.createElement(getGrowthIcon(platformStats.users.growth), { className: 'h-4 w-4 mr-1' })}
                    <span className={`text-sm font-medium ${getGrowthColor(platformStats.users.growth)}`}>
                      {formatPercentage(platformStats.users.growth)}
                    </span>
                  </div>
                </div>
                <UsersIcon className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Volume</p>
                  <p className="text-3xl font-bold">{formatCurrency(platformStats.volume.total)}</p>
                  <p className="text-green-100 text-sm mt-1">
                    Avg: {formatCurrency(parseFloat(platformStats.volume.average))}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">{platformStats.investments.successRate}%</p>
                  <p className="text-purple-100 text-sm mt-1">
                    {platformStats.investments.completed} completed
                  </p>
                </div>
                <TrendingUpIcon className="h-12 w-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Interest Rate</p>
                  <p className="text-3xl font-bold">{platformStats.performance.averageInterestRate.toFixed(1)}%</p>
                  <p className="text-orange-100 text-sm mt-1">
                    {platformStats.performance.averageRepaymentTime} days avg
                  </p>
                </div>
                <ClockIcon className="h-12 w-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Investment Statistics */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Investment Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Investments</span>
                  <span className="font-semibold">{formatNumber(platformStats.investments.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-blue-600">{formatNumber(platformStats.investments.active)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{formatNumber(platformStats.investments.completed)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Defaulted</span>
                  <span className="font-semibold text-red-600">{formatNumber(platformStats.investments.defaulted)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Default Rate</span>
                  <span className="font-semibold text-red-600">{platformStats.performance.defaultRate}%</span>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UsersIcon className="h-5 w-5 mr-2 text-green-600" />
                User Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verified Users</span>
                  <span className="font-semibold text-green-600">{formatNumber(platformStats.users.verified)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-blue-600">{formatNumber(platformStats.users.active)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Reputation</span>
                  <span className="font-semibold">{platformStats.reputation.averageScore.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Connections</span>
                  <span className="font-semibold">{formatNumber(platformStats.social.totalConnections)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Communities</span>
                  <span className="font-semibold">{formatNumber(platformStats.social.activeCommunities)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <StarIcon className="h-5 w-5 mr-2 text-yellow-600" />
              Top Reputation Users
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformStats.reputation.topUsers.slice(0, 6).map((user, index) => (
                <div key={user.username} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{user.score}</p>
                      <p className="text-xs text-gray-500">#{index + 1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Analytics Tab */}
      {activeTab === 'user' && userStats && (
        <div className="space-y-8">
          {/* User Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="text-center">
                <p className="text-blue-100 text-sm font-medium">Total Invested</p>
                <p className="text-3xl font-bold">{formatCurrency(userStats.overview.totalInvested)}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="text-center">
                <p className="text-green-100 text-sm font-medium">Total Returns</p>
                <p className="text-3xl font-bold">{formatCurrency(userStats.returns.totalRepayments)}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="text-center">
                <p className="text-purple-100 text-sm font-medium">ROI</p>
                <p className="text-3xl font-bold">{userStats.returns.roi}%</p>
              </div>
            </div>
          </div>

          {/* Investment Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{userStats.investments.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Investments</span>
                  <span className="font-semibold text-blue-600">{userStats.investments.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{userStats.investments.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Defaulted</span>
                  <span className="font-semibold text-red-600">{userStats.investments.defaulted}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-semibold">{userStats.social.followers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Following</span>
                  <span className="font-semibold">{userStats.social.following}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-semibold">{userStats.social.connections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Social Score</span>
                  <span className="font-semibold">{userStats.social.socialScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reputation History */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reputation History</h3>
            <div className="space-y-3">
              {userStats.reputation.history.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">{entry.reason}</p>
                    <p className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{entry.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="text-center py-12">
          <TrendingUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Trend Analysis
          </h3>
          <p className="text-gray-600">
            Detailed trend analysis and forecasting will be available here.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Last updated: {platformStats?.lastUpdated ? new Date(platformStats.lastUpdated).toLocaleString() : 'N/A'}
          </span>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </button>
            <button className="flex items-center text-green-600 hover:text-green-700">
              <DownloadIcon className="h-4 w-4 mr-1" />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
