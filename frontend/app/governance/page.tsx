'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';

interface Proposal {
  id: string;
  title: string;
  description: string;
  creator: string;
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'expired';
  createdAt: string;
  votingStart: string;
  votingEnd: string;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  quorumThreshold: number;
  majorityThreshold: number;
  userVote?: 'yes' | 'no';
}

const GovernancePage: React.FC = () => {
  const { isConnected } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    if (isConnected) {
      fetchProposals();
    }
  }, [isConnected]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = 'governance_proposals';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const now = Date.now();
      
      // Use cached data if it's less than 5 minutes old
      if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
        const cachedProposals = JSON.parse(cachedData);
        setProposals(cachedProposals);
        setLoading(false);
        return;
      }
      
      // Mock proposals - replace with actual API call
      const mockProposals: Proposal[] = [
        {
          id: '1',
          title: 'Increase Platform Fee to 2%',
          description: 'Proposal to increase the platform fee from 1.5% to 2% to fund additional security measures and platform improvements. The additional revenue will be used for enhanced risk assessment tools and better user support.',
          creator: 'Alice Johnson',
          status: 'active',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          votingStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          votingEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          yesVotes: 45,
          noVotes: 23,
          totalVotes: 68,
          quorumThreshold: 100,
          majorityThreshold: 51,
          userVote: undefined
        },
        {
          id: '2',
          title: 'Implement New Risk Assessment Algorithm',
          description: 'Proposal to implement a new AI-powered risk assessment algorithm that will provide more accurate risk scores and better protect investors. This will require additional development resources and testing.',
          creator: 'Bob Smith',
          status: 'active',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          votingStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          votingEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          yesVotes: 78,
          noVotes: 12,
          totalVotes: 90,
          quorumThreshold: 100,
          majorityThreshold: 51,
          userVote: 'yes'
        },
        {
          id: '3',
          title: 'Add Support for Additional Cryptocurrencies',
          description: 'Proposal to add support for USDC and USDT in addition to ALGO for investments. This would provide more flexibility for users and potentially attract more investors to the platform.',
          creator: 'Carol Davis',
          status: 'passed',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          votingStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          votingEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          yesVotes: 156,
          noVotes: 34,
          totalVotes: 190,
          quorumThreshold: 100,
          majorityThreshold: 51,
          userVote: 'yes'
        },
        {
          id: '4',
          title: 'Reduce Minimum Investment Amount',
          description: 'Proposal to reduce the minimum investment amount from $100 to $50 to make the platform more accessible to smaller investors and increase participation.',
          creator: 'David Wilson',
          status: 'rejected',
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          votingStart: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          votingEnd: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          yesVotes: 67,
          noVotes: 89,
          totalVotes: 156,
          quorumThreshold: 100,
          majorityThreshold: 51,
          userVote: 'no'
        }
      ];
      
      // Validate and sanitize proposals
      const validatedProposals = mockProposals.map(proposal => ({
        ...proposal,
        id: proposal.id.trim(),
        title: proposal.title.trim(),
        description: proposal.description.trim(),
        creator: proposal.creator.trim(),
        status: ['draft', 'active', 'passed', 'rejected', 'expired'].includes(proposal.status) 
          ? proposal.status 
          : 'draft' as 'draft' | 'active' | 'passed' | 'rejected' | 'expired',
        createdAt: proposal.createdAt,
        votingStart: proposal.votingStart,
        votingEnd: proposal.votingEnd,
        yesVotes: Math.max(0, proposal.yesVotes),
        noVotes: Math.max(0, proposal.noVotes),
        totalVotes: Math.max(0, proposal.totalVotes),
        quorumThreshold: Math.max(0, proposal.quorumThreshold),
        majorityThreshold: Math.max(0, Math.min(100, proposal.majorityThreshold)),
        userVote: proposal.userVote && ['yes', 'no'].includes(proposal.userVote) 
          ? proposal.userVote 
          : undefined
      }));
      
      setProposals(validatedProposals);
      
      // Cache the validated data
      localStorage.setItem(cacheKey, JSON.stringify(validatedProposals));
      localStorage.setItem(`${cacheKey}_time`, now.toString());
      
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      // Set fallback data on error
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!newProposal.title.trim()) {
      alert('Please enter a proposal title');
      return;
    }
    
    if (!newProposal.description.trim()) {
      alert('Please enter a proposal description');
      return;
    }
    
    if (newProposal.title.trim().length < 10) {
      alert('Proposal title must be at least 10 characters long');
      return;
    }
    
    if (newProposal.description.trim().length < 50) {
      alert('Proposal description must be at least 50 characters long');
      return;
    }
    
    try {
      setLoading(true);
      // Mock proposal creation - replace with actual API call
      const proposal: Proposal = {
        id: Date.now().toString(),
        title: newProposal.title.trim(),
        description: newProposal.description.trim(),
        creator: 'Current User',
        status: 'draft',
        createdAt: new Date().toISOString(),
        votingStart: new Date().toISOString(),
        votingEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        yesVotes: 0,
        noVotes: 0,
        totalVotes: 0,
        quorumThreshold: 100,
        majorityThreshold: 51
      };
      
      const updatedProposals = [proposal, ...proposals];
      setProposals(updatedProposals);
      
      // Update cache
      localStorage.setItem('governance_proposals', JSON.stringify(updatedProposals));
      localStorage.setItem('governance_proposals_time', Date.now().toString());
      
      setNewProposal({ title: '', description: '' });
      setShowCreateForm(false);
      
      alert('Proposal created successfully!');
    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: string, vote: 'yes' | 'no') => {
    try {
      setProposals(prev => 
        prev.map(proposal => 
          proposal.id === proposalId 
            ? {
                ...proposal,
                userVote: vote,
                yesVotes: vote === 'yes' ? proposal.yesVotes + 1 : proposal.yesVotes,
                noVotes: vote === 'no' ? proposal.noVotes + 1 : proposal.noVotes,
                totalVotes: proposal.totalVotes + 1
              }
            : proposal
        )
      );
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getVotingProgress = (proposal: Proposal) => {
    const progress = (proposal.totalVotes / proposal.quorumThreshold) * 100;
    const yesPercentage = proposal.totalVotes > 0 ? (proposal.yesVotes / proposal.totalVotes) * 100 : 0;
    return { progress: Math.min(progress, 100), yesPercentage };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isVotingActive = (proposal: Proposal) => {
    const now = new Date();
    const votingEnd = new Date(proposal.votingEnd);
    return proposal.status === 'active' && now < votingEnd;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to participate in governance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
              <p className="text-gray-600 mt-2">Participate in platform governance and decision making</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchProposals}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Proposal
              </button>
            </div>
          </div>
        </div>

        {/* Create Proposal Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="create-proposal-title">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="create-proposal-title" className="text-xl font-semibold text-gray-900">Create New Proposal</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close create proposal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreateProposal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a clear, concise title for your proposal"
                      required
                      aria-required="true"
                      aria-label="Proposal title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                      placeholder="Provide a detailed description of your proposal, including the rationale and expected impact"
                      required
                      aria-required="true"
                      aria-label="Proposal description"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Create proposal"
                    >
                      {loading ? 'Creating...' : 'Create Proposal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400"
                      aria-label="Cancel and close"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading proposals...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => {
              const { progress, yesPercentage } = getVotingProgress(proposal);
              const votingActive = isVotingActive(proposal);
              
              return (
                <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{proposal.title}</h3>
                      <p className="text-gray-600 mb-4">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {proposal.creator}</span>
                        <span>•</span>
                        <span>Created {formatDate(proposal.createdAt)}</span>
                        <span>•</span>
                        <span>Voting ends {formatDate(proposal.votingEnd)}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                      {proposal.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Voting Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Voting Progress</span>
                      <span className="text-sm text-gray-500">
                        {proposal.totalVotes} / {proposal.quorumThreshold} votes
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600">Yes: {proposal.yesVotes} ({yesPercentage.toFixed(1)}%)</span>
                        <span className="text-red-600">No: {proposal.noVotes} ({(100 - yesPercentage).toFixed(1)}%)</span>
                      </div>
                      <span className="text-gray-500">
                        {progress.toFixed(1)}% of quorum
                      </span>
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  {votingActive && (
                    <div className="flex items-center space-x-4">
                      {proposal.userVote ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">You voted:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            proposal.userVote === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {proposal.userVote === 'yes' ? 'Yes' : 'No'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVote(proposal.id, 'yes')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Vote Yes
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id, 'no')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Vote No
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Results Summary */}
                  {!votingActive && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Final Results</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Votes:</span>
                          <span className="ml-2 font-medium">{proposal.totalVotes}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quorum Met:</span>
                          <span className={`ml-2 font-medium ${
                            proposal.totalVotes >= proposal.quorumThreshold 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {proposal.totalVotes >= proposal.quorumThreshold ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Majority:</span>
                          <span className={`ml-2 font-medium ${
                            yesPercentage >= proposal.majorityThreshold 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {yesPercentage >= proposal.majorityThreshold ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Outcome:</span>
                          <span className={`ml-2 font-medium ${
                            proposal.status === 'passed' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {proposal.status === 'passed' ? 'Passed' : 'Rejected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernancePage;