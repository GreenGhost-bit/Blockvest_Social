'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';
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
  role: 'borrower' | 'investor';
  borrower?: {
    name: string;
    location: string;
    reputationScore: number;
  };
  investor?: {
    name: string;
    location: string;
    reputationScore: number;
  };
}

const InvestmentsPage: React.FC = () => {
  const { isConnected, user } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'my-investments'>('create');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    description: '',
    interestRate: '',
    duration: '',
  });

  useEffect(() => {
    if (isConnected && activeTab === 'my-investments') {
      fetchMyInvestments();
    }
  }, [isConnected, activeTab]);

  const fetchMyInvestments = async () => {
    try {
      setLoading(true);
      const response = await api.investments.getMyInvestments();
      setInvestments(response.investments);
    } catch (err) {
      setError('Failed to fetch your investments');
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.investments.create({
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        description: formData.description,
        interestRate: parseFloat(formData.interestRate),
        duration: parseInt(formData.duration),
      });

      setSuccess('Investment opportunity created successfully!');
      setFormData({
        amount: '',
        purpose: '',
        description: '',
        interestRate: '',
        duration: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create investment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            Please connect your wallet to create or manage investments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Investments</h1>
          <p className="text-lg text-gray-600">
            Create new investment opportunities or manage your existing ones
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Investment
              </button>
              <button
                onClick={() => setActiveTab('my-investments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-investments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Investments
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'create' ? (
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Needed (USD)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        min="1"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter amount"
                      />
                    </div>

                    <div>
                      <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose
                      </label>
                      <input
                        type="text"
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Education, Business, Medical"
                      />
                    </div>

                    <div>
                      <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        id="interestRate"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter interest rate"
                      />
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (months)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="60"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter duration in months"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your investment opportunity in detail..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Investment Opportunity'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your investments...</p>
                  </div>
                ) : investments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
                    <p className="text-gray-600">Create your first investment opportunity to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investments.map((investment) => (
                      <div key={investment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl font-bold text-gray-900">
                              {formatCurrency(investment.amount)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                              {investment.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {investment.role === 'borrower' ? 'Borrowing' : 'Investing'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="text-sm font-medium">{formatDate(investment.createdAt)}</p>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {investment.purpose}
                        </h3>

                        <p className="text-gray-600 mb-4">
                          {investment.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Interest Rate</p>
                            <p className="font-medium">{investment.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-medium">{investment.duration} months</p>
                          </div>
                          {investment.role === 'borrower' && investment.investor && (
                            <div>
                              <p className="text-gray-500">Investor</p>
                              <p className="font-medium">{investment.investor.name}</p>
                            </div>
                          )}
                          {investment.role === 'investor' && investment.borrower && (
                            <div>
                              <p className="text-gray-500">Borrower</p>
                              <p className="font-medium">{investment.borrower.name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsPage;