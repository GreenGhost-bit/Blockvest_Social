'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'policy' | 'emergency';
  status: 'active' | 'passed' | 'rejected' | 'executed' | 'paused' | 'cancelled';
  creator: {
    id: string;
    username: string;
    reputation_level: string;
  };
  createdAt: string;
  expiresAt: string;
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  totalVotingPower: number;
  requiredQuorum: number;
  executionThreshold: number;
  participation: {
    totalVoters: number;
    totalPower: number;
    quorumMet: boolean;
    quorumPercentage: number;
  };
  timeRemaining: {
    expired: boolean;
    days: number;
    hours: number;
    minutes: number;
  };
}

interface CreateProposalData {
  title: string;
  description: string;
  type: 'feature' | 'policy' | 'emergency';
  metadata?: Record<string, any>;
}

const GovernanceProposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'votes' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateProposalData>({
    title: '',
    description: '',
    type: 'feature'
  });

  useEffect(() => {
    fetchProposals();
  }, [activeTab, filterType, sortBy, sortOrder]);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for now - would be replaced with actual API call
      const mockProposals: Proposal[] = [
        {
          id: '1',
          title: 'Implement Advanced Risk Assessment Algorithm',
          description: 'Propose to upgrade the current risk assessment system with machine learning capabilities to provide more accurate credit scoring and reduce default rates.',
          type: 'feature',
          status: 'active',
          creator: {
            id: 'user1',
            username: 'alice_investor',
            reputation_level: 'excellent'
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          votes: { for: 45, against: 12, abstain: 8 },
          totalVotingPower: 65,
          requiredQuorum: 50,
          executionThreshold: 0.6,
          participation: {
            totalVoters: 65,
            totalPower: 65,
            quorumMet: true,
            quorumPercentage: 130
          },
          timeRemaining: {
            expired: false,
            days: 5,
            hours: 12,
            minutes: 30
          }
        },
        {
          id: '2',
          title: 'Update Platform Fee Structure',
          description: 'Propose changes to the platform fee structure to better align with market conditions and ensure sustainable platform growth.',
          type: 'policy',
          status: 'active',
          creator: {
            id: 'user2',
            username: 'bob_moderator',
            reputation_level: 'good'
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
          votes: { for: 23, against: 18, abstain: 5 },
          totalVotingPower: 46,
          requiredQuorum: 75,
          executionThreshold: 0.7,
          participation: {
            totalVoters: 46,
            totalPower: 46,
            quorumMet: false,
            quorumPercentage: 61.3
          },
          timeRemaining: {
            expired: false,
            days: 13,
            hours: 8,
            minutes: 45
          }
        },
        {
          id: '3',
          title: 'Emergency Security Protocol Update',
          description: 'Critical security update to address recently discovered vulnerabilities in the smart contract system.',
          type: 'emergency',
          status: 'passed',
          creator: {
            id: 'user3',
            username: 'security_team',
            reputation_level: 'excellent'
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          votes: { for: 89, against: 5, abstain: 2 },
          totalVotingPower: 96,
          requiredQuorum: 25,
          executionThreshold: 0.8,
          participation: {
            totalVoters: 96,
            totalPower: 96,
            quorumMet: true,
            quorumPercentage: 384
          },
          timeRemaining: {
            expired: true,
            days: 0,
            hours: 0,
            minutes: 0
          }
        }
      ];

      setProposals(mockProposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesTab = activeTab === 'all' || proposal.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || proposal.type === filterType;
    
    return matchesTab && matchesSearch && matchesType;
  });

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'votes':
        comparison = a.totalVotingPower - b.totalVotingPower;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock API call - would be replaced with actual implementation
      const newProposal: Proposal = {
        id: `prop_${Date.now()}`,
        ...createFormData,
        status: 'active',
        creator: {
          id: 'current_user',
          username: 'current_user',
          reputation_level: 'good'
        },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        votes: { for: 0, against: 0, abstain: 0 },
        totalVotingPower: 0,
        requiredQuorum: 50,
        executionThreshold: 0.6,
        participation: {
          totalVoters: 0,
          totalPower: 0,
          quorumMet: false,
          quorumPercentage: 0
        },
        timeRemaining: {
          expired: false,
          days: 7,
          hours: 0,
          minutes: 0
        }
      };

      setProposals([newProposal, ...proposals]);
      setShowCreateModal(false);
      setCreateFormData({ title: '', description: '', type: 'feature' });
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const handleVote = async (proposalId: string, vote: 'for' | 'against' | 'abstain') => {
    try {
      // Mock API call - would be replaced with actual implementation
      const updatedProposals = proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            votes: {
              ...proposal.votes,
              [vote]: proposal.votes[vote] + 1
            },
            totalVotingPower: proposal.totalVotingPower + 1
          };
        }
        return proposal;
      });

      setProposals(updatedProposals);
      setShowVoteModal(false);
      setSelectedProposal(null);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'passed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'executed': return 'text-purple-600 bg-purple-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'text-blue-600 bg-blue-100';
      case 'policy': return 'text-green-600 bg-green-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '🚀';
      case 'policy': return '📋';
      case 'emergency': return '🚨';
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeRemaining = (timeRemaining: Proposal['timeRemaining']) => {
    if (timeRemaining.expired) {
      return 'Expired';
    }
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
    } else {
      return `${timeRemaining.minutes}m remaining`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <DocumentTextIcon className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Proposals
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchProposals}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Governance Proposals
          </h2>
          <p className="text-gray-600">
            Participate in platform governance and decision-making
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Proposal
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="feature">Feature</option>
            <option value="policy">Policy</option>
            <option value="emergency">Emergency</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="votes-desc">Most Votes</option>
            <option value="votes-asc">Least Votes</option>
            <option value="type-asc">Type A-Z</option>
            <option value="type-desc">Type Z-A</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'all', label: 'All Proposals', count: proposals.length },
          { id: 'active', label: 'Active', count: proposals.filter(p => p.status === 'active').length },
          { id: 'passed', label: 'Passed', count: proposals.filter(p => p.status === 'passed').length },
          { id: 'rejected', label: 'Rejected', count: proposals.filter(p => p.status === 'rejected').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {sortedProposals.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No proposals found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterType !== 'all' || activeTab !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'Be the first to create a proposal!'
              }
            </p>
          </div>
        ) : (
          sortedProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(proposal.type)}</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {proposal.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {proposal.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-2 py-1 rounded-full ${getTypeColor(proposal.type)}`}>
                      {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                    <span className="flex items-center text-gray-500">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {proposal.creator.username}
                    </span>
                    <span className="text-gray-500">
                      Created {formatDate(proposal.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {proposal.totalVotingPower}
                    </div>
                    <div className="text-sm text-gray-500">Total Votes</div>
                  </div>
                  
                  {proposal.status === 'active' && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {formatTimeRemaining(proposal.timeRemaining)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Voting Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Voting Progress</span>
                  <span>{proposal.participation.quorumPercentage.toFixed(1)}% of quorum</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(proposal.participation.quorumPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Quorum: {proposal.requiredQuorum}</span>
                  <span>Threshold: {(proposal.executionThreshold * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Vote Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {proposal.votes.for}
                  </div>
                  <div className="text-sm text-gray-500">For</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {proposal.votes.against}
                  </div>
                  <div className="text-sm text-gray-500">Against</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-600">
                    {proposal.votes.abstain}
                  </div>
                  <div className="text-sm text-gray-500">Abstain</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setShowVoteModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Vote
                  </button>
                  
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Discuss
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  ID: {proposal.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Proposal</h3>
            
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter proposal title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={createFormData.type}
                  onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="feature">Feature Proposal</option>
                  <option value="policy">Policy Change</option>
                  <option value="emergency">Emergency Action</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Describe your proposal in detail"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vote Modal */}
      {showVoteModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Vote on Proposal</h3>
            <p className="text-gray-600 mb-6">{selectedProposal.title}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleVote(selectedProposal.id, 'for')}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Vote For
              </button>
              
              <button
                onClick={() => handleVote(selectedProposal.id, 'against')}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Vote Against
              </button>
              
              <button
                onClick={() => handleVote(selectedProposal.id, 'abstain')}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MinusCircleIcon className="h-5 w-5 mr-2" />
                Abstain
              </button>
            </div>
            
            <button
              onClick={() => setShowVoteModal(false)}
              className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceProposals;
