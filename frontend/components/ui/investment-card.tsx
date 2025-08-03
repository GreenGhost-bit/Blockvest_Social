'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from './wallet-provider';

interface InvestmentCardProps {
  investment: {
    id: string;
    amount: number;
    purpose: string;
    description?: string;
    interestRate: number;
    duration: number;
    status: string;
    riskScore?: number;
    verificationStatus?: string;
    borrower: {
      id: string;
      name: string;
      reputationScore: number;
      reputationLevel: string;
      profilePicture?: string;
      verified: boolean;
    };
    createdAt: string;
    fundedAt?: string;
    dueDate?: string;
    repaymentAmount?: number;
    remainingBalance?: number;
  };
  onFund?: (investmentId: string) => void;
  onRepay?: (investmentId: string) => void;
  showActions?: boolean;
}

export function InvestmentCard({ 
  investment, 
  onFund, 
  onRepay, 
  showActions = true 
}: InvestmentCardProps) {
  const { isConnected, user } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReputationColor = (level: string) => {
    switch (level) {
      case 'diamond':
        return 'text-purple-600 bg-purple-100';
      case 'platinum':
        return 'text-gray-600 bg-gray-100';
      case 'gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'silver':
        return 'text-gray-500 bg-gray-100';
      case 'bronze':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleFund = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      if (onFund) {
        await onFund(investment.id);
      }
    } catch (error) {
      console.error('Failed to fund investment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      if (onRepay) {
        await onRepay(investment.id);
      }
    } catch (error) {
      console.error('Failed to repay investment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isBorrower = user?.id === investment.borrower.id;
  const canFund = isConnected && !isBorrower && investment.status === 'pending';
  const canRepay = isConnected && isBorrower && investment.status === 'active';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={investment.borrower.profilePicture || '/default-avatar.png'}
                alt={investment.borrower.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {investment.borrower.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {investment.borrower.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReputationColor(investment.borrower.reputationLevel)}`}>
                  {investment.borrower.reputationLevel}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {investment.borrower.reputationScore} pts
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(investment.status)}`}>
              {investment.status}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(investment.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {investment.purpose}
          </h4>
          {investment.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {investment.description}
            </p>
          )}
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(investment.amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {investment.interestRate}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {investment.duration} days
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Risk Score</p>
            <p className={`text-lg font-semibold ${getRiskColor(investment.riskScore || 50)}`}>
              {investment.riskScore || 'N/A'}
            </p>
          </div>
        </div>

        {/* Additional Details */}
        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              {investment.fundedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Funded</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(investment.fundedAt)}
                  </p>
                </div>
              )}
              {investment.dueDate && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(investment.dueDate)}
                  </p>
                </div>
              )}
              {investment.repaymentAmount && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Repayment Amount</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(investment.repaymentAmount)}
                  </p>
                </div>
              )}
              {investment.remainingBalance && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(investment.remainingBalance)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex space-x-2">
              {canFund && (
                <button
                  onClick={handleFund}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-analytics-action="fund_investment"
                  data-analytics-category="investment"
                  data-analytics-label="fund"
                >
                  {isLoading ? 'Processing...' : 'Fund'}
                </button>
              )}
              {canRepay && (
                <button
                  onClick={handleRepay}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-analytics-action="repay_investment"
                  data-analytics-category="investment"
                  data-analytics-label="repay"
                >
                  {isLoading ? 'Processing...' : 'Repay'}
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
              <Link
                href={`/investments/${investment.id}`}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 