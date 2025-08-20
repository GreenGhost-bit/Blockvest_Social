'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  TrendingUpIcon,
  BellIcon,
  CogIcon,
  ArrowRightIcon
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
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: string;
}

interface DashboardProps {
  userId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API calls
      const mockStats: DashboardStats = {
        totalInvestments: 12,
        activeInvestments: 3,
        totalEarnings: 2450.75,
        reputationScore: 875,
        reputationLevel: 'gold',
        followers: 156,
        following: 89,
        connections: 23
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'investment',
          title: 'Investment Funded',
          description: 'Your investment in Sarah\'s business was funded',
          amount: 500,
          timestamp: '2 hours ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'repayment',
          title: 'Repayment Received',
          description: 'Received repayment from John\'s loan',
          amount: 150,
          timestamp: '1 day ago',
          status: 'completed'
        },
        {
          id: '3',
          type: 'follower',
          title: 'New Follower',
          description: 'Mike started following you',
          timestamp: '2 days ago',
          status: 'new'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReputationColor = (level: string) => {
    const colors = {
      bronze: 'text-amber-600',
      silver: 'text-gray-500',
      gold: 'text-yellow-500',
      platinum: 'text-blue-500',
      diamond: 'text-purple-500',
      master: 'text-red-500',
      legend: 'text-green-500'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600',
      new: 'text-blue-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusIcon = (type: string) => {
    const icons = {
      investment: '💰',
      repayment: '💸',
      follower: '👥',
      connection: '🔗',
      verification: '✅'
    };
    return icons[type as keyof typeof icons] || '📋';
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your investments.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Investments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalInvestments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Investments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.activeInvestments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">${stats?.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reputation Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.reputationScore}</p>
                <p className={`text-sm font-medium ${getReputationColor(stats?.reputationLevel || '')}`}>
                  {stats?.reputationLevel}
                </p>
              </div>
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
                  <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Invest</span>
                  </button>
                  <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                    <TrendingUpIcon className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Borrow</span>
                  </button>
                  <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                    <UserGroupIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Connect</span>
                  </button>
                  <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors">
                    <CogIcon className="h-8 w-8 text-yellow-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 text-2xl">
                        {getStatusIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        {activity.amount && (
                          <p className="text-sm font-medium text-green-600">${activity.amount}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
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
            {/* Social Stats */}
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
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Manage Network
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  <BellIcon className="h-5 w-5 text-gray-400" />
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

            {/* Reputation Progress */}
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
