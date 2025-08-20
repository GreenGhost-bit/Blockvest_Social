const mongoose = require('mongoose');
const User = require('../models/user');
const NotificationService = require('./notificationService');

class GovernanceService {
  constructor(io) {
    this.io = io;
    this.notificationService = new NotificationService(io);
    this.proposals = new Map();
    this.votes = new Map();
    this.delegations = new Map();
  }

  async createProposal(creatorId, proposalData) {
    try {
      const creator = await User.findById(creatorId);
      if (!creator) {
        throw new Error('Creator not found');
      }

      if (creator.reputation_level === 'poor') {
        throw new Error('Insufficient reputation to create proposals');
      }

      const proposal = {
        id: this.generateProposalId(),
        creator: creatorId,
        title: proposalData.title,
        description: proposalData.description,
        type: proposalData.type, // 'feature', 'policy', 'emergency'
        status: 'active',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.getVotingPeriod(proposalData.type) * 24 * 60 * 60 * 1000),
        votes: {
          for: 0,
          against: 0,
          abstain: 0
        },
        totalVotingPower: 0,
        requiredQuorum: this.calculateRequiredQuorum(proposalData.type),
        executionThreshold: this.getExecutionThreshold(proposalData.type),
        metadata: proposalData.metadata || {},
        executed: false,
        executedAt: null,
        executedBy: null
      };

      this.proposals.set(proposal.id, proposal);
      this.votes.set(proposal.id, new Map());

      // Notify users about new proposal
      await this.notifyProposalCreated(proposal);

      return proposal;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  async voteProposal(proposalId, voterId, vote, votingPower = null) {
    try {
      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.status !== 'active') {
        throw new Error('Proposal is not active for voting');
      }

      if (new Date() > proposal.expiresAt) {
        throw new Error('Voting period has expired');
      }

      const voter = await User.findById(voterId);
      if (!voter) {
        throw new Error('Voter not found');
      }

      // Check if user has already voted
      const existingVote = this.votes.get(proposalId).get(voterId);
      if (existingVote) {
        throw new Error('User has already voted on this proposal');
      }

      // Calculate voting power
      const userVotingPower = votingPower || this.calculateUserVotingPower(voter);
      
      // Record the vote
      const voteRecord = {
        voter: voterId,
        vote, // 'for', 'against', 'abstain'
        votingPower: userVotingPower,
        timestamp: new Date(),
        delegatedFrom: null
      };

      this.votes.get(proposalId).set(voterId, voteRecord);

      // Update proposal vote counts
      if (vote === 'for') {
        proposal.votes.for += userVotingPower;
      } else if (vote === 'against') {
        proposal.votes.against += userVotingPower;
      } else if (vote === 'abstain') {
        proposal.votes.abstain += userVotingPower;
      }

      proposal.totalVotingPower += userVotingPower;

      // Check if proposal can be executed
      await this.checkProposalExecution(proposal);

      // Notify about the vote
      await this.notifyVoteCast(proposal, voter, vote, userVotingPower);

      return {
        success: true,
        proposal,
        voteRecord
      };
    } catch (error) {
      console.error('Error voting on proposal:', error);
      throw error;
    }
  }

  async delegateVotingPower(delegatorId, delegateId, proposalId, power) {
    try {
      const delegator = await User.findById(delegatorId);
      const delegate = await User.findById(delegateId);

      if (!delegator || !delegate) {
        throw new Error('User not found');
      }

      if (delegatorId === delegateId) {
        throw new Error('Cannot delegate to yourself');
      }

      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.status !== 'active') {
        throw new Error('Proposal is not active for delegation');
      }

      // Check if delegator has already voted
      const existingVote = this.votes.get(proposalId).get(delegatorId);
      if (existingVote) {
        throw new Error('Cannot delegate after voting');
      }

      // Check if delegator has already delegated
      const existingDelegation = this.delegations.get(proposalId)?.get(delegatorId);
      if (existingDelegation) {
        throw new Error('Already delegated voting power for this proposal');
      }

      // Initialize delegation tracking
      if (!this.delegations.has(proposalId)) {
        this.delegations.set(proposalId, new Map());
      }

      const delegation = {
        delegator: delegatorId,
        delegate: delegateId,
        power,
        timestamp: new Date(),
        proposalId
      };

      this.delegations.get(proposalId).set(delegatorId, delegation);

      // Notify delegate about delegation
      await this.notifyDelegationReceived(delegation);

      return {
        success: true,
        delegation
      };
    } catch (error) {
      console.error('Error delegating voting power:', error);
      throw error;
    }
  }

  async cancelDelegation(delegatorId, proposalId) {
    try {
      const delegation = this.delegations.get(proposalId)?.get(delegatorId);
      if (!delegation) {
        throw new Error('No delegation found to cancel');
      }

      // Check if proposal is still active
      const proposal = this.proposals.get(proposalId);
      if (proposal.status !== 'active') {
        throw new Error('Cannot cancel delegation on inactive proposal');
      }

      // Remove delegation
      this.delegations.get(proposalId).delete(delegatorId);

      // Notify delegate about cancellation
      await this.notifyDelegationCancelled(delegation);

      return {
        success: true,
        message: 'Delegation cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling delegation:', error);
      throw error;
    }
  }

  async executeProposal(proposalId, executorId) {
    try {
      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.executed) {
        throw new Error('Proposal has already been executed');
      }

      if (proposal.status !== 'passed') {
        throw new Error('Proposal must be passed before execution');
      }

      const executor = await User.findById(executorId);
      if (!executor) {
        throw new Error('Executor not found');
      }

      if (!['admin', 'moderator'].includes(executor.role)) {
        throw new Error('Insufficient permissions to execute proposal');
      }

      // Execute the proposal based on type
      const executionResult = await this.executeProposalAction(proposal);

      // Update proposal status
      proposal.executed = true;
      proposal.executedAt = new Date();
      proposal.executedBy = executorId;
      proposal.status = 'executed';

      // Notify about execution
      await this.notifyProposalExecuted(proposal, executionResult);

      return {
        success: true,
        proposal,
        executionResult
      };
    } catch (error) {
      console.error('Error executing proposal:', error);
      throw error;
    }
  }

  async getProposalInfo(proposalId) {
    try {
      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      const votes = this.votes.get(proposalId);
      const delegations = this.delegations.get(proposalId);

      // Get detailed vote information
      const voteDetails = [];
      for (const [voterId, voteRecord] of votes) {
        const voter = await User.findById(voterId, 'username reputation_level');
        voteDetails.push({
          ...voteRecord,
          voter: voter ? { id: voter._id, username: voter.username, reputation: voter.reputation_level } : null
        });
      }

      // Get delegation information
      const delegationDetails = [];
      if (delegations) {
        for (const [delegatorId, delegation] of delegations) {
          const delegator = await User.findById(delegatorId, 'username');
          const delegate = await User.findById(delegation.delegate, 'username');
          delegationDetails.push({
            ...delegation,
            delegator: delegator ? { id: delegator._id, username: delegator.username } : null,
            delegate: delegate ? { id: delegate._id, username: delegate.username } : null
          });
        }
      }

      return {
        ...proposal,
        voteDetails,
        delegationDetails,
        participation: this.calculateParticipation(proposal),
        timeRemaining: this.calculateTimeRemaining(proposal)
      };
    } catch (error) {
      console.error('Error getting proposal info:', error);
      throw error;
    }
  }

  async getActiveProposals() {
    try {
      const activeProposals = [];
      for (const [id, proposal] of this.proposals) {
        if (proposal.status === 'active') {
          const proposalInfo = await this.getProposalInfo(id);
          activeProposals.push(proposalInfo);
        }
      }

      return activeProposals.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting active proposals:', error);
      throw error;
    }
  }

  async getUserProposals(userId) {
    try {
      const userProposals = [];
      for (const [id, proposal] of this.proposals) {
        if (proposal.creator.toString() === userId.toString()) {
          userProposals.push(proposal);
        }
      }

      return userProposals.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting user proposals:', error);
      throw error;
    }
  }

  async getUserVotes(userId) {
    try {
      const userVotes = [];
      for (const [proposalId, votes] of this.votes) {
        const userVote = votes.get(userId);
        if (userVote) {
          const proposal = this.proposals.get(proposalId);
          userVotes.push({
            proposal: {
              id: proposalId,
              title: proposal.title,
              type: proposal.type,
              status: proposal.status
            },
            ...userVote
          });
        }
      }

      return userVotes.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting user votes:', error);
      throw error;
    }
  }

  async emergencyPause(proposalId, reason) {
    try {
      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.status !== 'active') {
        throw new Error('Only active proposals can be paused');
      }

      proposal.status = 'paused';
      proposal.pauseReason = reason;
      proposal.pausedAt = new Date();

      // Notify about pause
      await this.notifyProposalPaused(proposal, reason);

      return {
        success: true,
        proposal
      };
    } catch (error) {
      console.error('Error pausing proposal:', error);
      throw error;
    }
  }

  async resumeProposal(proposalId) {
    try {
      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.status !== 'paused') {
        throw new Error('Only paused proposals can be resumed');
      }

      proposal.status = 'active';
      delete proposal.pauseReason;
      delete proposal.pausedAt;

      // Notify about resume
      await this.notifyProposalResumed(proposal);

      return {
        success: true,
        proposal
      };
    } catch (error) {
      console.error('Error resuming proposal:', error);
      throw error;
    }
  }

  async cancelProposal(proposalId, reason) {
    try {
      const proposal = this.proposals.get(proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.status === 'executed') {
        throw new Error('Cannot cancel executed proposal');
      }

      proposal.status = 'cancelled';
      proposal.cancelReason = reason;
      proposal.cancelledAt = new Date();

      // Notify about cancellation
      await this.notifyProposalCancelled(proposal, reason);

      return {
        success: true,
        proposal
      };
    } catch (error) {
      console.error('Error cancelling proposal:', error);
      throw error;
    }
  }

  // Helper methods
  generateProposalId() {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getVotingPeriod(type) {
    const periods = {
      feature: 7, // 7 days
      policy: 14, // 14 days
      emergency: 3 // 3 days
    };
    return periods[type] || 7;
  }

  calculateRequiredQuorum(type) {
    const quorums = {
      feature: 0.1, // 10% of total voting power
      policy: 0.15, // 15% of total voting power
      emergency: 0.05 // 5% of total voting power
    };
    return quorums[type] || 0.1;
  }

  getExecutionThreshold(type) {
    const thresholds = {
      feature: 0.6, // 60% approval
      policy: 0.7, // 70% approval
      emergency: 0.8 // 80% approval
    };
    return thresholds[type] || 0.6;
  }

  calculateUserVotingPower(user) {
    let power = 1; // Base power

    // Reputation multiplier
    const reputationMultipliers = {
      excellent: 3,
      good: 2,
      fair: 1.5,
      poor: 0.5
    };
    power *= reputationMultipliers[user.reputation_level] || 1;

    // Verification bonus
    if (user.verification_status === 'verified') {
      power *= 1.2;
    }

    // Activity bonus
    if (user.last_active && Date.now() - user.last_active < 7 * 24 * 60 * 60 * 1000) {
      power *= 1.1;
    }

    return Math.round(power * 100) / 100;
  }

  async checkProposalExecution(proposal) {
    try {
      const totalPower = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
      
      if (totalPower < proposal.requiredQuorum) {
        return; // Quorum not met
      }

      const approvalRate = proposal.votes.for / (proposal.votes.for + proposal.votes.against);
      
      if (approvalRate >= proposal.executionThreshold) {
        proposal.status = 'passed';
        await this.notifyProposalPassed(proposal);
      } else if (proposal.votes.against > proposal.votes.for) {
        proposal.status = 'rejected';
        await this.notifyProposalRejected(proposal);
      }
    } catch (error) {
      console.error('Error checking proposal execution:', error);
    }
  }

  calculateParticipation(proposal) {
    const totalUsers = this.votes.get(proposal.id)?.size || 0;
    const totalPower = proposal.totalVotingPower;
    
    return {
      totalVoters: totalUsers,
      totalPower,
      quorumMet: totalPower >= proposal.requiredQuorum,
      quorumPercentage: totalPower / proposal.requiredQuorum * 100
    };
  }

  calculateTimeRemaining(proposal) {
    const now = new Date();
    const expiresAt = new Date(proposal.expiresAt);
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, days, hours, minutes };
  }

  async executeProposalAction(proposal) {
    try {
      switch (proposal.type) {
        case 'feature':
          return await this.executeFeatureProposal(proposal);
        case 'policy':
          return await this.executePolicyProposal(proposal);
        case 'emergency':
          return await this.executeEmergencyProposal(proposal);
        default:
          return { success: true, message: 'Proposal executed successfully' };
      }
    } catch (error) {
      console.error('Error executing proposal action:', error);
      throw error;
    }
  }

  async executeFeatureProposal(proposal) {
    // Implement feature-specific logic
    return { success: true, message: 'Feature proposal executed successfully' };
  }

  async executePolicyProposal(proposal) {
    // Implement policy-specific logic
    return { success: true, message: 'Policy proposal executed successfully' };
  }

  async executeEmergencyProposal(proposal) {
    // Implement emergency-specific logic
    return { success: true, message: 'Emergency proposal executed successfully' };
  }

  // Notification methods
  async notifyProposalCreated(proposal) {
    try {
      await this.notificationService.sendSystemAnnouncement({
        title: 'New Governance Proposal',
        message: `A new ${proposal.type} proposal has been created: ${proposal.title}`,
        type: 'governance',
        data: { proposalId: proposal.id }
      });
    } catch (error) {
      console.error('Error notifying proposal creation:', error);
    }
  }

  async notifyVoteCast(proposal, voter, vote, power) {
    try {
      await this.notificationService.sendToUser(voter._id, {
        title: 'Vote Recorded',
        message: `Your ${vote} vote on "${proposal.title}" has been recorded with ${power} voting power.`,
        type: 'governance',
        data: { proposalId: proposal.id, vote, power }
      });
    } catch (error) {
      console.error('Error notifying vote cast:', error);
    }
  }

  async notifyDelegationReceived(delegation) {
    try {
      await this.notificationService.sendToUser(delegation.delegate, {
        title: 'Voting Power Delegated',
        message: `You have received ${delegation.power} voting power delegation for a governance proposal.`,
        type: 'governance',
        data: { delegationId: delegation._id }
      });
    } catch (error) {
      console.error('Error notifying delegation received:', error);
    }
  }

  async notifyDelegationCancelled(delegation) {
    try {
      await this.notificationService.sendToUser(delegation.delegate, {
        title: 'Delegation Cancelled',
        message: 'A voting power delegation has been cancelled.',
        type: 'governance',
        data: { delegationId: delegation._id }
      });
    } catch (error) {
      console.error('Error notifying delegation cancelled:', error);
    }
  }

  async notifyProposalPassed(proposal) {
    try {
      await this.notificationService.sendSystemAnnouncement({
        title: 'Proposal Passed',
        message: `The proposal "${proposal.title}" has passed and is ready for execution.`,
        type: 'governance',
        data: { proposalId: proposal.id }
      });
    } catch (error) {
      console.error('Error notifying proposal passed:', error);
    }
  }

  async notifyProposalRejected(proposal) {
    try {
      await this.notificationService.sendSystemAnnouncement({
        title: 'Proposal Rejected',
        message: `The proposal "${proposal.title}" has been rejected.`,
        type: 'governance',
        data: { proposalId: proposal.id }
      });
    } catch (error) {
      console.error('Error notifying proposal rejected:', error);
    }
  }

  async notifyProposalExecuted(proposal, result) {
    try {
      await this.notificationService.sendSystemAnnouncement({
        title: 'Proposal Executed',
        message: `The proposal "${proposal.title}" has been executed successfully.`,
        type: 'governance',
        data: { proposalId: proposal.id, result }
      });
    } catch (error) {
      console.error('Error notifying proposal executed:', error);
    }
  }

  async notifyProposalPaused(proposal, reason) {
    try {
      await this.notificationService.sendSystemAnnouncement({
        title: 'Proposal Paused',
        message: `The proposal "${proposal.title}" has been paused: ${reason}`,
        type: 'governance',
        data: { proposalId: proposal.id, reason }
      });
    } catch (error) {
      console.error('Error notifying proposal paused:', error);
    }
  }

  async notifyProposalResumed(proposal) {
    try {
      await this.notificationService.sendSystemAnnouncement({
        title: 'Proposal Resumed',
        message: `The proposal "${proposal.title}" has been resumed.`,
        type: 'governance',
        data: { proposalId: proposal.id }
      });
    } catch (error) {
      console.error('Error notifying proposal resumed:', error);
    }
  }

  async notifyProposalCancelled(proposal, reason) {
    try {
      await this.notificationService.sendSystemAnnouncement({
        title: 'Proposal Cancelled',
        message: `The proposal "${proposal.title}" has been cancelled: ${reason}`,
        type: 'governance',
        data: { proposalId: proposal.id, reason }
      });
    } catch (error) {
      console.error('Error notifying proposal cancelled:', error);
    }
  }
}

module.exports = GovernanceService;
