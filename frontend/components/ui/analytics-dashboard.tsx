'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../lib/api';

interface AnalyticsData {
  totalInvestments: number;
  totalVolume: number;
  averageInvestmentSize: number;
  successRate: number;
  platformFees: number;
  activeUsers: number;
  monthlyGrowth: number;
  algorandTransactions: number;
  averageBlockTime: number;
  networkHealth: 'healthy' | 'degraded' | 'down';
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    timestamp: string;
    status: string;
    user: string;
    category: string;
  }>;
  investmentTrends: Array<{
    month: string;
    investments: number;
    volume: number;
    roi: number;
    riskScore: number;
  }>;
  userMetrics: {
    newUsers: number;
    returningUsers: number;
    churnRate: number;
    averageSessionDuration: number;
    topPerformingUsers: Array<{
      id: string;
      name: string;
      roi: number;
      totalInvested: number;
      reputation: number;
    }>;
  };
  riskMetrics: {
    averageRiskScore: number;
    highRiskInvestments: number;
    defaultRate: number;
    collateralCoverage: number;
    riskDistribution: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
  };
  geographicData: {
    regions: Array<{
      name: string;
      users: number;
      volume: number;
      growth: number;
    }>;
    topCountries: Array<{
      country: string;
      users: number;
      volume: number;
    }>;
  };
  socialMetrics: {
    totalConnections: number;
    averageConnectionsPerUser: number;
    viralCoefficient: number;
    engagementRate: number;
    topInfluencers: Array<{
      id: string;
      name: string;
      followers: number;
      influence: number;
    }>;
  };
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh, refreshInterval]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/dashboard?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getNetworkHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'very high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (value: number, previousValue: number) => {
    if (value > previousValue) return '📈';
    if (value < previousValue) return '📉';
    return '➡️';
  };

  const getTrendColor = (value: number, previousValue: number) => {
    if (value > previousValue) return 'text-green-600';
    if (value < previousValue) return 'text-red-600';
    return 'text-gray-600';
  };

  const filteredTransactions = useMemo(() => {
    if (!analytics) return [];
    
    let filtered = analytics.recentTransactions;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(tx => tx.category === filterCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(tx => 
        tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [analytics, filterCategory, searchQuery]);

  const chartData: ChartData = useMemo(() => {
    if (!analytics) return { labels: [], datasets: [] };
    
    return {
      labels: analytics.investmentTrends.map(t => t.month),
      datasets: [
        {
          label: 'Investment Volume',
          data: analytics.investmentTrends.map(t => t.volume),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
        {
          label: 'ROI %',
          data: analytics.investmentTrends.map(t => t.roi),
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
        }
      ]
    };
  }, [analytics]);

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Failed to load analytics'}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex flex-wrap items-center space-x-4">
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap space-x-2">
          {['overview', 'users', 'risk', 'geographic', 'social'].map((metric) => (
            <button
              key={metric}
              onClick={() => handleMetricChange(metric)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Investments</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(analytics.totalInvestments)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">💰</span>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm text-green-600">+{analytics.monthlyGrowth}%</span>
            <span className="text-xs text-gray-500">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Volume</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.totalVolume)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">📊</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-gray-600">Avg: {formatCurrency(analytics.averageInvestmentSize)}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{formatPercentage(analytics.successRate)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-lg">✅</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm text-gray-600">{formatNumber(analytics.activeUsers)} active users</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Network Health</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.algorandTransactions}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-lg">⚡</span>
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-xs px-2 py-1 rounded-full ${getNetworkHealthColor(analytics.networkHealth)}`}>
              {analytics.networkHealth}
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Section */}
      {showAdvancedMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Metrics</h3>
            <button
              onClick={() => setShowAdvancedMetrics(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{analytics.riskMetrics.averageRiskScore}</p>
              <p className="text-sm text-gray-500">Average Risk Score</p>
              <p className="text-xs text-gray-400 mt-1">Scale: 0-100</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics.riskMetrics.defaultRate)}</p>
              <p className="text-sm text-gray-500">Default Rate</p>
              <p className="text-xs text-gray-400 mt-1">Lower is better</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics.socialMetrics.engagementRate)}</p>
              <p className="text-sm text-gray-500">Engagement Rate</p>
              <p className="text-xs text-gray-400 mt-1">User interaction</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Investment Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Investment Trends</h3>
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
          <div className="space-y-4">
            {analytics.investmentTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{trend.month}</p>
                  <p className="text-xs text-gray-500">{trend.investments} investments</p>
                  {showAdvancedMetrics && (
                    <p className="text-xs text-gray-400">Risk: {trend.riskScore}/100</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(trend.volume)}</p>
                  <p className="text-xs text-green-600">ROI: {formatPercentage(trend.roi)}</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((trend.volume / Math.max(...analytics.investmentTrends.map(t => t.volume))) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="investment">Investment</option>
                <option value="repayment">Repayment</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredTransactions.slice(0, 8).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    tx.status === 'confirmed' ? 'bg-green-500' : 
                    tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                    <p className="text-xs text-gray-500">{tx.user}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(tx.amount)}</p>
                  <p className="text-xs text-gray-500">{tx.id.slice(0, 8)}...</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.category === 'investment' ? 'bg-blue-100 text-blue-800' :
                    tx.category === 'repayment' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tx.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {analytics.riskMetrics.riskDistribution.map((risk, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{risk.count}</p>
              <p className="text-sm text-gray-600 capitalize">{risk.level}</p>
              <p className="text-xs text-gray-500">{risk.percentage}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    risk.level.toLowerCase() === 'low' ? 'bg-green-500' :
                    risk.level.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                    risk.level.toLowerCase() === 'high' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${risk.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Top Regions</h4>
            <div className="space-y-3">
              {analytics.geographicData.regions.slice(0, 5).map((region, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-900">{region.name}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(region.users)} users</p>
                    <p className="text-xs text-gray-500">{formatCurrency(region.volume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Growth Leaders</h4>
            <div className="space-y-3">
              {analytics.geographicData.regions
                .filter(r => r.growth > 0)
                .sort((a, b) => b.growth - a.growth)
                .slice(0, 5)
                .map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">{region.name}</span>
                    <span className="text-sm text-green-600">+{region.growth}%</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Top Countries</h4>
            <div className="space-y-3">
              {analytics.geographicData.topCountries.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-900">{country.country}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(country.users)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(country.volume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Network Health Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Algorand Network Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{analytics.averageBlockTime}s</p>
            <p className="text-sm text-gray-500">Average Block Time</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.algorandTransactions)}</p>
            <p className="text-sm text-gray-500">Platform Transactions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.platformFees)}</p>
            <p className="text-sm text-gray-500">Total Fees Collected</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.userMetrics.averageSessionDuration)}m</p>
            <p className="text-sm text-gray-500">Avg Session Duration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;