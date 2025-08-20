const express = require('express');
const router = express.Router();
const GovernanceService = require('../services/governanceService');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { rateLimitAction } = require('../middleware/auth');

// Initialize governance service with Socket.IO instance
// This would typically be passed from the main server file
let governanceService;

// Middleware to initialize governance service
const initializeGovernanceService = (req, res, next) => {
  if (!governanceService) {
    // For now, create without io instance - would be passed from server
    governanceService = new GovernanceService(null);
  }
  next();
};

// Rate limiting for governance endpoints
const governanceRateLimit = rateLimitAction({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many governance requests from this IP, please try again later.'
});

// Apply middleware to all routes
router.use(initializeGovernanceService);
router.use(governanceRateLimit);

// Create a new proposal (authenticated users with good reputation)
router.post('/proposals', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, metadata } = req.body;

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and type are required'
      });
    }

    // Validate proposal type
    const validTypes = ['feature', 'policy', 'emergency'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proposal type. Must be one of: feature, policy, emergency'
      });
    }

    // Check user reputation requirement
    const user = req.user;
    if (user.reputation_level === 'poor') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient reputation to create proposals. Minimum required: Fair'
      });
    }

    const proposal = await governanceService.createProposal(user.id, {
      title,
      description,
      type,
      metadata
    });

    res.status(201).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create proposal'
    });
  }
});

// Get all active proposals (public)
router.get('/proposals', async (req, res) => {
  try {
    const { status, type, creator, page = 1, limit = 10 } = req.query;
    
    let proposals;
    if (status === 'active') {
      proposals = await governanceService.getActiveProposals();
    } else if (creator) {
      proposals = await governanceService.getUserProposals(creator);
    } else {
      // Get all proposals (this would need to be implemented in the service)
      proposals = [];
    }

    // Apply filters
    if (type) {
      proposals = proposals.filter(p => p.type === type);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProposals = proposals.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        proposals: paginatedProposals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(proposals.length / limit),
          totalProposals: proposals.length,
          hasNext: endIndex < proposals.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch proposals'
    });
  }
});

// Get specific proposal details (public)
router.get('/proposals/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await governanceService.getProposalInfo(proposalId);

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Proposal not found'
    });
  }
});

// Vote on a proposal (authenticated)
router.post('/proposals/:proposalId/vote', authenticateToken, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { vote, votingPower } = req.body;

    // Validate vote
    const validVotes = ['for', 'against', 'abstain'];
    if (!validVotes.includes(vote)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote. Must be one of: for, against, abstain'
      });
    }

    const result = await governanceService.voteProposal(proposalId, req.user.id, vote, votingPower);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error voting on proposal:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to vote on proposal'
    });
  }
});

// Delegate voting power (authenticated)
router.post('/proposals/:proposalId/delegate', authenticateToken, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { delegateId, power } = req.body;

    if (!delegateId || !power) {
      return res.status(400).json({
        success: false,
        error: 'Delegate ID and power are required'
      });
    }

    if (power <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Voting power must be greater than 0'
      });
    }

    const result = await governanceService.delegateVotingPower(
      req.user.id,
      delegateId,
      proposalId,
      power
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error delegating voting power:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to delegate voting power'
    });
  }
});

// Cancel delegation (authenticated)
router.delete('/proposals/:proposalId/delegate', authenticateToken, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const result = await governanceService.cancelDelegation(req.user.id, proposalId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error cancelling delegation:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cancel delegation'
    });
  }
});

// Execute a passed proposal (admin/moderator only)
router.post('/proposals/:proposalId/execute', authenticateToken, authorizeRole(['admin', 'moderator']), async (req, res) => {
  try {
    const { proposalId } = req.params;
    const result = await governanceService.executeProposal(proposalId, req.user.id);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing proposal:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to execute proposal'
    });
  }
});

// Emergency pause proposal (admin only)
router.post('/proposals/:proposalId/pause', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required for pausing a proposal'
      });
    }

    const result = await governanceService.emergencyPause(proposalId, reason);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error pausing proposal:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to pause proposal'
    });
  }
});

// Resume paused proposal (admin only)
router.post('/proposals/:proposalId/resume', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { proposalId } = req.params;
    const result = await governanceService.resumeProposal(proposalId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error resuming proposal:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to resume proposal'
    });
  }
});

// Cancel proposal (creator or admin only)
router.delete('/proposals/:proposalId', authenticateToken, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required for cancelling a proposal'
      });
    }

    // Check if user is creator or admin
    const proposal = await governanceService.getProposalInfo(proposalId);
    if (proposal.creator !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only proposal creator or admin can cancel proposals'
      });
    }

    const result = await governanceService.cancelProposal(proposalId, reason);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error cancelling proposal:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cancel proposal'
    });
  }
});

// Get user's voting history (authenticated)
router.get('/user/votes', authenticateToken, async (req, res) => {
  try {
    const votes = await governanceService.getUserVotes(req.user.id);

    res.json({
      success: true,
      data: votes
    });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user votes'
    });
  }
});

// Get user's proposals (authenticated)
router.get('/user/proposals', authenticateToken, async (req, res) => {
  try {
    const proposals = await governanceService.getUserProposals(req.user.id);

    res.json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching user proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user proposals'
    });
  }
});

// Get governance statistics (public)
router.get('/stats', async (req, res) => {
  try {
    const activeProposals = await governanceService.getActiveProposals();
    
    // Calculate basic statistics
    const stats = {
      totalActive: activeProposals.length,
      byType: {
        feature: activeProposals.filter(p => p.type === 'feature').length,
        policy: activeProposals.filter(p => p.type === 'policy').length,
        emergency: activeProposals.filter(p => p.type === 'emergency').length
      },
      byStatus: {
        active: activeProposals.filter(p => p.status === 'active').length,
        passed: activeProposals.filter(p => p.status === 'passed').length,
        rejected: activeProposals.filter(p => p.status === 'rejected').length,
        executed: activeProposals.filter(p => p.status === 'executed').length
      },
      participation: {
        totalVoters: activeProposals.reduce((sum, p) => sum + (p.participation?.totalVoters || 0), 0),
        averageQuorum: activeProposals.reduce((sum, p) => sum + (p.participation?.quorumPercentage || 0), 0) / Math.max(activeProposals.length, 1)
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching governance statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch governance statistics'
    });
  }
});

// Get user's voting power (authenticated)
router.get('/user/voting-power', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const votingPower = governanceService.calculateUserVotingPower(user);

    res.json({
      success: true,
      data: {
        votingPower,
        factors: {
          reputation: user.reputation_level,
          verification: user.verification_status,
          lastActive: user.last_active,
          reputationMultiplier: governanceService.getReputationMultiplier(user.reputation_level)
        }
      }
    });
  } catch (error) {
    console.error('Error calculating voting power:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate voting power'
    });
  }
});

// Search proposals (public)
router.get('/search', async (req, res) => {
  try {
    const { q, type, status, creator, dateFrom, dateTo } = req.query;
    
    let proposals = [];
    
    // Get all proposals (this would need to be implemented in the service)
    // For now, return empty array
    proposals = [];

    // Apply search filters
    if (q) {
      proposals = proposals.filter(p => 
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.description.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (type) {
      proposals = proposals.filter(p => p.type === type);
    }

    if (status) {
      proposals = proposals.filter(p => p.status === status);
    }

    if (creator) {
      proposals = proposals.filter(p => p.creator === creator);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      proposals = proposals.filter(p => new Date(p.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      proposals = proposals.filter(p => new Date(p.createdAt) <= toDate);
    }

    res.json({
      success: true,
      data: {
        proposals,
        total: proposals.length,
        query: { q, type, status, creator, dateFrom, dateTo }
      }
    });
  } catch (error) {
    console.error('Error searching proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search proposals'
    });
  }
});

// Export proposal data (admin only)
router.get('/export/:proposalId', authenticateToken, authorizeRole(['admin', 'moderator']), async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { format = 'json' } = req.query;

    const proposal = await governanceService.getProposalInfo(proposalId);

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertProposalToCSV(proposal);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="proposal_${proposalId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data: proposal,
        exportInfo: {
          format,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error exporting proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export proposal'
    });
  }
});

// Helper function to convert proposal data to CSV
function convertProposalToCSV(proposal) {
  const rows = [
    ['Proposal ID', proposal.id],
    ['Title', proposal.title],
    ['Description', proposal.description],
    ['Type', proposal.type],
    ['Status', proposal.status],
    ['Creator', proposal.creator],
    ['Created At', proposal.createdAt],
    ['Expires At', proposal.expiresAt],
    ['Votes For', proposal.votes.for],
    ['Votes Against', proposal.votes.against],
    ['Votes Abstain', proposal.votes.abstain],
    ['Total Voting Power', proposal.totalVotingPower],
    ['Required Quorum', proposal.requiredQuorum],
    ['Execution Threshold', proposal.executionThreshold]
  ];

  // Add vote details
  if (proposal.voteDetails && proposal.voteDetails.length > 0) {
    rows.push(['', '']);
    rows.push(['Vote Details', '']);
    rows.push(['Voter', 'Vote', 'Voting Power', 'Timestamp']);
    
    proposal.voteDetails.forEach(vote => {
      rows.push([
        vote.voter?.username || vote.voter?.id || 'Unknown',
        vote.vote,
        vote.votingPower,
        vote.timestamp
      ]);
    });
  }

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

module.exports = router;
