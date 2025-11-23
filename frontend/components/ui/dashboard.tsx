'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  TrendingUpIcon,
  BellIcon,
  CogIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalInvestments: number;
  activeInvestments: number;
  totalEarnings: number;
  reputationScore: number;
  reputationLevel: string;
  followers: number;
  following: number;
  connections: number;
  portfolioValue: number;
  monthlyGrowth: number;
  riskScore: number;
  verificationStatus: string;
  lastActive: string;
  totalTransactions: number;
  averageROI: number;
  pendingActions: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  actionRequired?: boolean;
}

interface PerformanceMetric {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface DashboardProps {
  userId?: string;
  refreshInterval?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, refreshInterval = 30000 }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(false);
  const [filteredActivities, setFilteredActivities] = useState<RecentActivity[]>([]);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
      if (autoRefresh) {
        const interval = setInterval(fetchDashboardData, refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [userId, autoRefresh, refreshInterval]);

  useEffect(() => {
    filterActivities();
  }, [recentActivity, activityFilter, searchQuery]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const mockStats: DashboardStats = {
        totalInvestments: 18,
        activeInvestments: 5,
        totalEarnings: 3247.85,
        reputationScore: 892,
        reputationLevel: 'gold',
        followers: 234,
        following: 156,
        connections: 45,
        portfolioValue: 15680.50,
        monthlyGrowth: 12.5,
        riskScore: 23,
        verificationStatus: 'verified',
        lastActive: '2 minutes ago',
        totalTransactions: 89,
        averageROI: 8.7,
        pendingActions: 3
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'investment',
          title: 'Investment Funded',
          description: 'Your investment in Sarah\'s business was funded',
          amount: 500,
          timestamp: '2 hours ago',
          status: 'completed',
          priority: 'medium',
          category: 'investment'
        },
        {
          id: '2',
          type: 'repayment',
          title: 'Repayment Received',
          description: 'Received repayment from John\'s loan',
          amount: 150,
          timestamp: '1 day ago',
          status: 'completed',
          priority: 'low',
          category: 'repayment'
        },
        {
          id: '3',
          type: 'follower',
          title: 'New Follower',
          description: 'Mike started following you',
          timestamp: '2 days ago',
          status: 'new',
          priority: 'low',
          category: 'social'
        },
        {
          id: '4',
          type: 'verification',
          title: 'Verification Required',
          description: 'Please complete your identity verification',
          timestamp: '1 hour ago',
          status: 'pending',
          priority: 'high',
          category: 'verification',
          actionRequired: true
        },
        {
          id: '5',
          type: 'risk',
          title: 'Risk Alert',
          description: 'High volatility detected in your portfolio',
          timestamp: '30 minutes ago',
          status: 'warning',
          priority: 'urgent',
          category: 'risk',
          actionRequired: true
        }
      ];

      const mockPerformance: PerformanceMetric[] = [
        { period: '1W', value: 8.2, change: 2.1, trend: 'up' },
        { period: '1M', value: 12.5, change: 5.3, trend: 'up' },
        { period: '3M', value: 18.7, change: -1.2, trend: 'down' },
        { period: '1Y', value: 45.2, change: 12.8, trend: 'up' }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      setPerformanceMetrics(mockPerformance);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterActivities = useCallback(() => {
    let filtered = recentActivity;
    
    if (activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.category === activityFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredActivities(filtered);
  }, [recentActivity, activityFilter, searchQuery]);

  const getReputationColor = (level: string) => {
    if (!level || typeof level !== 'string') {
      return 'text-gray-600';
    }
    const colors = {
      bronze: 'text-amber-600',
      silver: 'text-gray-500',
      gold: 'text-yellow-500',
      platinum: 'text-blue-500',
      diamond: 'text-purple-500',
      master: 'text-red-500',
      legend: 'text-green-500'
    };
    return colors[level.toLowerCase() as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600',
      new: 'text-blue-600',
      warning: 'text-orange-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (type: string) => {
    const icons = {
      investment: '💰',
      repayment: '💸',
      follower: '👥',
      connection: '🔗',
      verification: '✅',
      risk: '⚠️'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.0%';
    }
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
  };

  const handleActivityAction = (activityId: string, action: string) => {
    console.log(`Activity action: ${action} for ${activityId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your investments.</p>
            </div>
            <div className="flex items-center space-x-4">
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
                onClick={() => fetchDashboardData()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats?.portfolioValue || 0)}</p>
                <p className="text-sm text-green-600">{formatPercentage(stats?.monthlyGrowth || 0)} this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average ROI</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.averageROI}%</p>
                <p className="text-sm text-blue-600">Based on {stats?.totalInvestments} investments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.riskScore}/100</p>
                <p className="text-sm text-indigo-600">Low risk profile</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Actions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.pendingActions}</p>
                <p className="text-sm text-orange-600">Requires attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">{metric.period}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}%</p>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-sm mr-1">{getTrendIcon(metric.trend)}</span>
                    <span className={`text-sm ${
                      metric.change > 0 ? 'text-green-600' : 
                      metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatPercentage(metric.change)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Overview & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => handleQuickAction('invest')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all transform hover:scale-105"
                  >
                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Invest</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('borrow')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all transform hover:scale-105"
                  >
                    <TrendingUpIcon className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Borrow</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('connect')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all transform hover:scale-105"
                  >
                    <UserGroupIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Connect</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('settings')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all transform hover:scale-105"
                  >
                    <CogIcon className="h-8 w-8 text-yellow-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="investment">Investment</option>
                      <option value="repayment">Repayment</option>
                      <option value="social">Social</option>
                      <option value="verification">Verification</option>
                      <option value="risk">Risk</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-all border-l-4 border-transparent hover:border-blue-200">
                      <div className="flex-shrink-0 text-2xl">
                        {getStatusIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                            {activity.priority}
                          </span>
                          {activity.actionRequired && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        {activity.amount && (
                          <p className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        {activity.actionRequired && (
                          <button
                            onClick={() => handleActivityAction(activity.id, 'take_action')}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    View All Activity
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Social & Notifications */}
          <div className="space-y-8">
            {/* Enhanced Social Stats */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Social Network</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Followers</span>
                    <span className="text-lg font-semibold text-gray-900">{stats?.followers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Following</span>
                    <span className="text-lg font-semibold text-gray-900">{stats?.following}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connections</span>
                    <span className="text-lg font-semibold text-gray-900">{stats?.connections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Active</span>
                    <span className="text-sm text-gray-500">{stats?.lastActive}</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Manage Network
                </button>
              </div>
            </div>

            {/* Enhanced Notifications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <BellIcon className="h-5 w-5 text-gray-400" />
                    {stats?.pendingActions > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {stats.pendingActions}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">New investment opportunity available</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">Repayment received from John</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">Verification status updated</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  View All
                </button>
              </div>
            </div>

            {/* Enhanced Reputation Progress */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Reputation Progress</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Level</span>
                      <span className={`font-medium ${getReputationColor(stats?.reputationLevel || '')}`}>
                        {stats?.reputationLevel}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((stats?.reputationScore || 0) % 1000) / 10}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats?.reputationScore} / {Math.ceil((stats?.reputationScore || 0) / 1000) * 1000} points
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900">{stats?.totalTransactions}</p>
                      <p className="text-gray-500">Transactions</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900">{stats?.verificationStatus}</p>
                      <p className="text-gray-500">Status</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
