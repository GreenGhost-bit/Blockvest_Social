import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';

interface InvestmentCardProps {
  investment: {
    appId: number;
    amount: number;
    purpose: string;
    interestRate: number;
    duration: number;
    status: string;
    borrower: string;
    investor?: string;
    fundedAt?: number;
    repaymentAmount?: number;
    riskScore?: number;
    verificationStatus?: string;
    createdAt?: number;
    collateralAmount?: number;
    gracePeriod?: number;
    penaltyRate?: number;
    borrowerReputation?: number;
    borrowerVerification?: boolean;
    tags?: string[];
    category?: string;
  };
  onFund?: (appId: number, amount: number) => void;
  onRepay?: (appId: number, amount: number) => void;
  onLiquidate?: (appId: number) => void;
  onRefinance?: (appId: number) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showAnalytics?: boolean;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onFund,
  onRepay,
  onLiquidate,
  onRefinance,
  showActions = true,
  variant = 'default',
  showAnalytics = false
}) => {
  const { account, fundInvestment, makeRepayment, loading } = useBlockchain();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (investment.status === 'active' && investment.fundedAt && investment.duration) {
      const timer = setInterval(() => {
        const now = Date.now();
        const endTime = (investment.fundedAt! * 1000) + (investment.duration * 24 * 60 * 60 * 1000);
        const remaining = endTime - now;
        
        if (remaining > 0) {
          const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
          const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          setTimeRemaining(`${days}d ${hours}h`);
        } else {
          setTimeRemaining('Expired');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [investment.status, investment.fundedAt, investment.duration]);

  const handleFund = async () => {
    if (!account || !onFund) return;
    
    try {
      await fundInvestment(investment.appId, investment.amount, investment.borrower);
      onFund(investment.appId, investment.amount);
    } catch (error) {
      console.error('Failed to fund investment:', error);
    }
  };

  const handleRepay = async () => {
    if (!account || !investment.investor || !onRepay) return;
    
    try {
      await makeRepayment(investment.appId, investment.repaymentAmount || investment.amount, investment.investor);
      onRepay(investment.appId, investment.repaymentAmount || investment.amount);
    } catch (error) {
      console.error('Failed to make repayment:', error);
    }
  };

  const handleLiquidate = async () => {
    if (!onLiquidate) return;
    onLiquidate(investment.appId);
  };

  const handleRefinance = async () => {
    if (!onRefinance) return;
    onRefinance(investment.appId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'defaulted':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'liquidated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏰';
      case 'active':
        return '📈';
      case 'completed':
        return '✅';
      case 'defaulted':
        return '❌';
      case 'liquidated':
        return '⚠️';
      case 'paused':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getRiskColor = (riskScore?: number) => {
    if (!riskScore) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    if (riskScore >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (riskScore >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (riskScore >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getRiskLevel = (riskScore?: number) => {
    if (!riskScore) return 'Unknown';
    if (riskScore >= 80) return 'Low';
    if (riskScore >= 60) return 'Medium';
    if (riskScore >= 40) return 'High';
    return 'Very High';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
  };

  const calculateROI = () => {
    if (!investment.repaymentAmount || !investment.amount) return 0;
    return ((investment.repaymentAmount - investment.amount) / investment.amount * 100).toFixed(2);
  };

  const isOwner = account === investment.borrower;
  const isInvestor = account === investment.investor;
  const canFund = showActions && !isOwner && investment.status === 'pending';
  const canRepay = showActions && isOwner && investment.status === 'active';
  const canLiquidate = showActions && isInvestor && investment.status === 'defaulted' && investment.collateralAmount;
  const canRefinance = showActions && isOwner && investment.status === 'active';

  const renderCompactCard = () => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-4 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">#{investment.appId}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(investment.status)}`}>
            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">{formatAmount(investment.amount)}</span>
          <span className="text-sm text-gray-500">ALGO</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{investment.purpose}</p>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-green-600 font-medium">{investment.interestRate}% APR</span>
        <span className="text-gray-500">{investment.duration}d</span>
      </div>
    </div>
  );

  const renderDetailedCard = () => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-2">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-1">
              Investment #{investment.appId}
            </h3>
            <p className="text-blue-100 text-sm">
              Created {formatDate(investment.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 flex items-center space-x-1">
              <span>{getStatusIcon(investment.status)}</span>
              <span>{investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}</span>
            </div>
            {investment.riskScore && (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                Risk: {getRiskLevel(investment.riskScore)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Investment Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-2xl font-bold text-gray-900">{formatAmount(investment.amount)}</p>
            <p className="text-xs text-gray-500">Amount</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-2xl font-bold text-blue-600">{investment.interestRate}%</p>
            <p className="text-xs text-gray-500">Interest Rate</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-2xl font-bold text-gray-900">{investment.duration}</p>
            <p className="text-xs text-gray-500">Days</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-2xl font-bold text-green-600">{calculateROI()}%</p>
            <p className="text-xs text-gray-500">ROI</p>
          </div>
        </div>

        {/* Purpose and Description */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Investment Purpose</h4>
          <p className="text-gray-900 leading-relaxed">{investment.purpose}</p>
        </div>

        {/* Tags and Category */}
        {(investment.tags || investment.category) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {investment.category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {investment.category}
                </span>
              )}
              {investment.tags?.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Borrower and Investor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium text-gray-700">Borrower</span>
            </div>
            <p className="text-sm text-gray-900 font-mono mb-1">
              {investment.borrower.slice(0, 8)}...{investment.borrower.slice(-6)}
            </p>
            <div className="flex items-center space-x-2 text-xs">
              {investment.borrowerVerification && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center space-x-1">
                  <span>✅</span>
                  <span>Verified</span>
                </span>
              )}
              {investment.borrowerReputation && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {investment.borrowerReputation}/100
                </span>
              )}
            </div>
          </div>
          
          {investment.investor && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">👤</span>
                <span className="text-sm font-medium text-gray-700">Investor</span>
              </div>
              <p className="text-sm text-gray-900 font-mono">
                {investment.investor.slice(0, 8)}...{investment.investor.slice(-6)}
              </p>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Funded Date</p>
            <p className="text-gray-900 font-medium">{formatDate(investment.fundedAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Repayment</p>
            <p className="text-gray-900 font-medium">
              {investment.repaymentAmount ? `${formatAmount(investment.repaymentAmount)} ALGO` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Verification</p>
            <p className="text-gray-900 font-medium capitalize">
              {investment.verificationStatus || 'Pending'}
            </p>
          </div>
          {investment.collateralAmount && (
            <div>
              <p className="text-gray-500 mb-1">Collateral</p>
              <p className="text-gray-900 font-medium">{formatAmount(investment.collateralAmount)} ALGO</p>
            </div>
          )}
        </div>

        {/* Time Remaining for Active Investments */}
        {investment.status === 'active' && timeRemaining && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⏰</span>
              <span className="text-sm font-medium text-yellow-800">Time Remaining</span>
            </div>
            <p className="text-lg font-bold text-yellow-900 mt-1">{timeRemaining}</p>
          </div>
        )}

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Analytics</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{calculateROI()}%</p>
                <p className="text-xs text-gray-500">Total Return</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {investment.duration > 0 ? (investment.amount * investment.interestRate / 100 / investment.duration * 365).toFixed(2) : 0}%
                </p>
                <p className="text-xs text-gray-500">APY</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {investment.riskScore ? (100 - investment.riskScore) : 0}
                </p>
                <p className="text-xs text-gray-500">Safety Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {canFund && (
                <button
                  onClick={handleFund}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                >
                  <span>📈</span>
                  <span>{loading ? 'Processing...' : 'Fund Investment'}</span>
                </button>
              )}
              
              {canRepay && (
                <button
                  onClick={handleRepay}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                >
                  <span>💰</span>
                  <span>{loading ? 'Processing...' : 'Make Repayment'}</span>
                </button>
              )}

              {canLiquidate && (
                <button
                  onClick={handleLiquidate}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                >
                  <span>⚠️</span>
                  <span>Liquidate</span>
                </button>
              )}

              {canRefinance && (
                <button
                  onClick={handleRefinance}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                >
                  <span>📈</span>
                  <span>Refinance</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full transition-colors transform hover:scale-110 active:scale-90 ${
                    isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
                </button>
                
                <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors transform hover:scale-110 active:scale-90">
                  <span className="text-lg">📤</span>
                </button>
              </div>

              <button
                onClick={() => window.open(`/investments/${investment.appId}`, '_blank')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2 transform hover:scale-105 active:scale-95"
              >
                <span>👁️</span>
                <span>View Details</span>
                <span>🔗</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDefaultCard = () => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 transform hover:-translate-y-1">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Investment #{investment.appId}
            </h3>
            <p className="text-sm text-gray-500">
              Created {formatDate(investment.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(investment.status)}`}>
              {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
            </span>
            {investment.riskScore && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(investment.riskScore)}`}>
                Risk: {investment.riskScore}/100
              </span>
            )}
          </div>
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {investment.amount} ALGO
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Interest Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {investment.interestRate}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-gray-900">{investment.duration} days</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Repayment</p>
            <p className="text-gray-900">
              {investment.repaymentAmount ? `${investment.repaymentAmount} ALGO` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Purpose</p>
          <p className="text-gray-900">{investment.purpose}</p>
        </div>

        {/* Borrower/Investor Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Borrower</p>
            <p className="text-sm text-gray-900 font-mono">
              {investment.borrower.slice(0, 8)}...{investment.borrower.slice(-6)}
            </p>
          </div>
          {investment.investor && (
            <div>
              <p className="text-sm font-medium text-gray-500">Investor</p>
              <p className="text-sm text-gray-900 font-mono">
                {investment.investor.slice(0, 8)}...{investment.investor.slice(-6)}
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Funded Date</p>
            <p className="text-gray-900">{formatDate(investment.fundedAt)}</p>
          </div>
          <div>
            <p className="text-gray-500">Verification</p>
            <p className="text-gray-900 capitalize">
              {investment.verificationStatus || 'Pending'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            {canFund && (
              <button
                onClick={handleFund}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Processing...' : 'Fund Investment'}
              </button>
            )}
            
            {canRepay && (
              <button
                onClick={handleRepay}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Processing...' : 'Make Repayment'}
              </button>
            )}

            <button
              onClick={() => window.open(`/investments/${investment.appId}`, '_blank')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors transform hover:scale-105 active:scale-95"
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'compact') {
    return renderCompactCard();
  }

  if (variant === 'detailed') {
    return renderDetailedCard();
  }

  return renderDefaultCard();
};

export default InvestmentCard; 