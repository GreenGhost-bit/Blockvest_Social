import React from 'react';
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
  };
  onFund?: (appId: number, amount: number) => void;
  onRepay?: (appId: number, amount: number) => void;
  showActions?: boolean;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onFund,
  onRepay,
  showActions = true
}) => {
  const { account, fundInvestment, makeRepayment, loading } = useBlockchain();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'defaulted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskScore?: number) => {
    if (!riskScore) return 'bg-gray-100 text-gray-800';
    
    if (riskScore >= 80) return 'bg-green-100 text-green-800';
    if (riskScore >= 60) return 'bg-yellow-100 text-yellow-800';
    if (riskScore >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const isOwner = account === investment.borrower;
  const isInvestor = account === investment.investor;
  const canFund = showActions && !isOwner && investment.status === 'pending';
  const canRepay = showActions && isOwner && investment.status === 'active';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
              {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
            </span>
            {investment.riskScore && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(investment.riskScore)}`}>
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
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Fund Investment'}
              </button>
            )}
            
            {canRepay && (
              <button
                onClick={handleRepay}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Make Repayment'}
              </button>
            )}

            <button
              onClick={() => window.open(`/investments/${investment.appId}`, '_blank')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentCard; 