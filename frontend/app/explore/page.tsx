'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';
import RiskAssessmentDisplay from '../../components/ui/risk-assessment-display';
import api from '../../lib/api';

interface Investment {
  id: string;
  amount: number;
  purpose: string;
  description: string;
  interestRate: number;
  duration: number;
  status: string;
  createdAt: string;
  borrower: {
    name: string;
    location: string;
    reputationScore: number;
  };
}

const ExplorePage: React.FC = () => {
  const { isConnected } = useWallet();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showRiskDetails, setShowRiskDetails] = useState(false);
  const [sortBy, setSortBy] = useState<'amount' | 'interestRate' | 'duration' | 'reputation'>('amount');
  const [filterBy, setFilterBy] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    fetchInvestments();
  }, [page, sortBy, filterBy]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await api.investments.explore({ 
        page, 
        limit: 10, 
        status: 'pending',
        sortBy,
        filterBy 
      });
      setInvestments(response.investments);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError('Failed to fetch investments');
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFundInvestment = async (investment: Investment) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setSelectedInvestment(investment);
  };

  const handleViewRiskDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowRiskDetails(true);
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

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading investment opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <button
            onClick={fetchInvestments}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Investment Opportunities</h1>
          <p className="text-lg text-gray-600">
            Discover and support entrepreneurs and individuals seeking funding for their goals
          </p>
        </div>

        {/* Sorting and Filtering Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="amount">Amount</option>
                  <option value="interestRate">Interest Rate</option>
                  <option value="duration">Duration</option>
                  <option value="reputation">Reputation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by risk</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {investments.length} opportunities found
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-800">
                Connect your wallet to invest in opportunities and support borrowers
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment) => (
            <div key={investment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(investment.amount)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReputationColor(investment.borrower.reputationScore)}`}>
                    {investment.borrower.reputationScore}/100
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {investment.purpose}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {investment.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Borrower</span>
                    <span className="text-sm font-medium">{investment.borrower.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-medium">{investment.borrower.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Interest Rate</span>
                    <span className="text-sm font-medium">{investment.interestRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="text-sm font-medium">{investment.duration} months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Posted</span>
                    <span className="text-sm font-medium">{formatDate(investment.createdAt)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFundInvestment(investment)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Fund Investment
                  </button>
                  <button 
                    onClick={() => handleViewRiskDetails(investment)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    aria-label={`View risk details for ${investment.purpose}`}
                  >
                    View Risk
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Risk Details Modal */}
        {showRiskDetails && selectedInvestment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk Assessment - {selectedInvestment.purpose}
                </h3>
                <button
                  onClick={() => {
                    setShowRiskDetails(false);
                    setSelectedInvestment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close risk details"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <RiskAssessmentDisplay 
                  investmentId={selectedInvestment.id} 
                  showDetailed={true}
                />
              </div>
            </div>
          </div>
        )}

        {investments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments available</h3>
            <p className="text-gray-600">Check back later for new investment opportunities</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded-lg ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;