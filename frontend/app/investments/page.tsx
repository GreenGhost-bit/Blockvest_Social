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
  role: string;
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
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    amount: '',
    purpose: '',
    description: '',
    interestRate: '',
    duration: ''
  });

  useEffect(() => {
    if (isConnected) {
      fetchInvestments();
    }
  }, [isConnected]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await api.investments.getMyInvestments();
      setInvestments(response.investments);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.investments.create({
        amount: parseFloat(newInvestment.amount),
        purpose: newInvestment.purpose,
        description: newInvestment.description,
        interestRate: parseFloat(newInvestment.interestRate),
        duration: parseInt(newInvestment.duration)
      });
      
      setNewInvestment({
        amount: '',
        purpose: '',
        description: '',
        interestRate: '',
        duration: ''
      });
      setShowCreateForm(false);
      await fetchInvestments();
    } catch (error) {
      console.error('Failed to create investment:', error);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to view and manage investments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
              <p className="text-gray-600 mt-2">Manage your investment portfolio</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Investment
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Investment</h2>
            <form onSubmit={handleCreateInvestment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (ALGO)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="1000"
                    value={newInvestment.amount}
                    onChange={(e) => setNewInvestment({ ...newInvestment, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newInvestment.interestRate}
                    onChange={(e) => setNewInvestment({ ...newInvestment, interestRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newInvestment.duration}
                    onChange={(e) => setNewInvestment({ ...newInvestment, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <input
                    type="text"
                    maxLength={500}
                    value={newInvestment.purpose}
                    onChange={(e) => setNewInvestment({ ...newInvestment, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Business expansion, Education, Emergency fund"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newInvestment.description}
                  onChange={(e) => setNewInvestment({ ...newInvestment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Provide more details about your investment request..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Investment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading investments...</p>
          </div>
        ) : investments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first investment or exploring opportunities.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Investment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((investment) => (
              <div key={investment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{investment.purpose}</h3>
                    <p className="text-sm text-gray-600">{investment.role === 'borrower' ? 'Borrowing' : 'Investing'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                    {investment.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-medium">{formatCurrency(investment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Rate:</span>
                    <span className="text-sm font-medium">{investment.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium">{investment.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium">
                      {new Date(investment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {investment.description && (
                  <p className="text-sm text-gray-600 mb-4">{investment.description}</p>
                )}

                {investment.borrower && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Borrower:</p>
                    <p className="text-sm font-medium">{investment.borrower.name}</p>
                    <p className="text-xs text-gray-500">Reputation: {investment.borrower.reputationScore}/100</p>
                  </div>
                )}

                {investment.investor && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">Investor:</p>
                    <p className="text-sm font-medium">{investment.investor.name}</p>
                    <p className="text-xs text-gray-500">Reputation: {investment.investor.reputationScore}/100</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentsPage;