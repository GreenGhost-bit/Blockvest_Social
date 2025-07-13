'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';
import api from '../../lib/api';

interface RiskDistribution {
  _id: string;
  count: number;
  averageScore: number;
}

interface CategoryAverages {
  avgCreditworthiness: number;
  avgFinancialStability: number;
  avgReputationHistory: number;
  avgInvestmentPurpose: number;
  avgDocumentationQuality: number;
  avgPlatformBehavior: number;
  avgExternalValidation: number;
}

interface TrendData {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  avgRiskScore: number;
  assessmentCount: number;
}

interface RiskAnalytics {
  totalAssessments: number;
  riskDistribution: RiskDistribution[];
  categoryAverages: CategoryAverages;
  recentTrends: TrendData[];
  timeframe: number;
}

const RiskAnalyticsPage: React.FC = () => {
  const { isConnected, user } = useWallet();
  const [analytics, setAnalytics] = useState<RiskAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<number>(30);

  const isAdmin = user?.profile?.userType === 'admin';

  useEffect(() => {
    if (isConnected && isAdmin) {
      fetchAnalytics();
    }
  }, [isConnected, isAdmin, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/risk-assessment/analytics/platform?timeframe=${timeframe}`);
      setAnalytics(response.analytics);
    } catch (err) {
      setError('Failed to fetch risk analytics');
      console.error('Risk analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'very_low':
        return 'bg-green-500';
      case 'low':
        return 'bg-green-400';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'very_high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/avg/g, '').replace(/([A-Z])/g, ' $1').trim();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-green-500';
    if (score >= 45) return 'text-yellow-600';
    if (score >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Please connect your wallet to access risk analytics
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            Admin privileges required to view risk analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Assessment Analytics</h1>
            <p className="text-gray-600 mt-2">
              Platform-wide risk assessment insights and trends
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="timeframe" className="text-sm font-medium text-gray-700">
              Timeframe:
            </label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Assessments</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalAssessments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Average Risk Score</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.recentTrends.length > 0 
                        ? Math.round(analytics.recentTrends.reduce((sum, trend) => sum + trend.avgRiskScore, 0) / analytics.recentTrends.length)
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">High Risk Count</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.riskDistribution.find(d => d._id === 'high' || d._id === 'very_high')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Assessment Trend</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.recentTrends.length >= 2 ? (
                        analytics.recentTrends[analytics.recentTrends.length - 1].avgRiskScore > 
                        analytics.recentTrends[0].avgRiskScore ? '📈' : '📉'
                      ) : '➡️'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {['very_low', 'low', 'medium', 'high', 'very_high'].map((level) => {
                  const data = analytics.riskDistribution.find(d => d._id === level);
                  const count = data?.count || 0;
                  const percentage = analytics.totalAssessments > 0 
                    ? Math.round((count / analytics.totalAssessments) * 100) 
                    : 0;
                  
                  return (
                    <div key={level} className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${getRiskLevelColor(level)}`}>
                        <span className="text-white font-bold text-lg">{count}</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900">{getRiskLevelLabel(level)}</h4>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                      {data && (
                        <p className="text-xs text-gray-400">
                          Avg: {Math.round(data.averageScore)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analytics.categoryAverages)
                  .filter(([key]) => key.startsWith('avg'))
                  .map(([key, value]) => {
                    const score = Math.round(value || 0);
                    return (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          {formatCategoryName(key)}
                        </h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {score}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 65 ? 'bg-green-500' :
                              score >= 45 ? 'bg-yellow-500' :
                              score >= 25 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Trends Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Trends</h3>
              {analytics.recentTrends.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Daily Average Risk Scores</h4>
                      <div className="space-y-2">
                        {analytics.recentTrends.slice(-10).map((trend, index) => {
                          const date = new Date(trend._id.year, trend._id.month - 1, trend._id.day);
                          return (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-600">
                                {date.toLocaleDateString()}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getScoreColor(trend.avgRiskScore)}`}>
                                  {Math.round(trend.avgRiskScore)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({trend.assessmentCount} assessments)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Assessment Volume</h4>
                      <div className="space-y-2">
                        {analytics.recentTrends.slice(-10).map((trend, index) => {
                          const date = new Date(trend._id.year, trend._id.month - 1, trend._id.day);
                          const maxCount = Math.max(...analytics.recentTrends.map(t => t.assessmentCount));
                          const barWidth = maxCount > 0 ? (trend.assessmentCount / maxCount) * 100 : 0;
                          
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 w-20">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                <div
                                  className="bg-blue-500 h-4 rounded-full"
                                  style={{ width: `${barWidth}%` }}
                                ></div>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                  {trend.assessmentCount}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No trend data available for the selected timeframe</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RiskAnalyticsPage;