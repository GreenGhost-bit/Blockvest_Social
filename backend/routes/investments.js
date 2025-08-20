const express = require('express');
const algosdk = require('algosdk');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const { autoAssessInvestment, validateRiskThreshold } = require('../middleware/riskAssessmentMiddleware');

const router = express.Router();

// Enhanced investment creation with better validation and gas optimization
router.post('/create', authenticateToken, validateRiskThreshold, autoAssessInvestment, async (req, res) => {
  try {
    const { amount, purpose, description, interestRate, duration } = req.body;
    
    // Enhanced validation
    if (!amount || amount < 0.001 || amount > 1000) {
      return res.status(400).json({ error: 'Invalid amount. Must be between 0.001 and 1000 ALGO' });
    }
    
    if (!purpose || purpose.length > 500) {
      return res.status(400).json({ error: 'Invalid purpose. Must be provided and under 500 characters' });
    }
    
    if (!interestRate || interestRate < 0 || interestRate > 100) {
      return res.status(400).json({ error: 'Invalid interest rate. Must be between 0 and 100' });
    }
    
    if (!duration || duration < 1 || duration > 365) {
      return res.status(400).json({ error: 'Invalid duration. Must be between 1 and 365 days' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const algodClient = req.app.locals.algodClient;
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Optimized transaction creation with gas efficiency
    const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
      from: user.walletAddress,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: new Uint8Array(Buffer.from(getInvestmentApprovalProgram(), 'base64')),
      clearProgram: new Uint8Array(Buffer.from(getInvestmentClearProgram(), 'base64')),
      numLocalInts: 0,
      numLocalByteSlices: 0,
      numGlobalInts: 4,
      numGlobalByteSlices: 4,
      appArgs: [
        algosdk.encodeUint64(amount * 1000000), // Convert to microAlgos
        new Uint8Array(Buffer.from(purpose)),
        algosdk.encodeUint64(interestRate),
        algosdk.encodeUint64(duration)
      ]
    });

    const investment = new Investment({
      contractAddress: '', 
      borrower: user._id,
      amount,
      purpose,
      description,
      interestRate,
      duration,
      repaymentSchedule: generateRepaymentSchedule(amount, interestRate, duration),
      status: 'pending',
      riskScore: user.riskScore || 50,
      verificationStatus: user.verificationStatus || 'pending'
    });

    await investment.save();

    res.json({
      message: 'Investment opportunity created successfully',
      investment: {
        id: investment._id,
        amount: investment.amount,
        purpose: investment.purpose,
        description: investment.description,
        interestRate: investment.interestRate,
        duration: investment.duration,
        status: investment.status,
        riskScore: investment.riskScore,
        verificationStatus: investment.verificationStatus,
        createdAt: investment.createdAt
      },
      unsignedTransaction: Buffer.from(algosdk.encodeUnsignedTransaction(appCreateTxn)).toString('base64')
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ error: 'Failed to create investment opportunity' });
  }
});

// Enhanced funding with better validation and error handling
router.post('/fund', authenticateToken, async (req, res) => {
  try {
    const { investmentId, transactionId } = req.body;
    
    if (!investmentId || !transactionId) {
      return res.status(400).json({ error: 'Investment ID and transaction ID are required' });
    }
    
    const investment = await Investment.findById(investmentId).populate('borrower');
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.status !== 'pending') {
      return res.status(400).json({ error: 'Investment is not available for funding' });
    }

    const investor = await User.findById(req.user.userId);
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    if (investor._id.toString() === investment.borrower._id.toString()) {
      return res.status(400).json({ error: 'Cannot fund your own investment' });
    }

    const indexerClient = req.app.locals.indexerClient;
    
    try {
      const txnInfo = await indexerClient.lookupTransactionByID(transactionId).do();
      
      if (!txnInfo.transaction || !txnInfo.transaction['payment-transaction']) {
        return res.status(400).json({ error: 'Invalid transaction' });
      }
      
      const paymentAmount = txnInfo.transaction['payment-transaction'].amount;
      const expectedAmount = investment.amount * 1000000; // Convert to microAlgos
      
      if (paymentAmount !== expectedAmount) {
        return res.status(400).json({ 
          error: `Payment amount mismatch. Expected ${investment.amount} ALGO, received ${paymentAmount / 1000000} ALGO` 
        });
      }
    } catch (txnError) {
      console.error('Transaction verification error:', txnError);
      return res.status(400).json({ error: 'Failed to verify transaction' });
    }

    investment.investor = investor._id;
    investment.status = 'active';
    investment.fundedAt = new Date();
    investment.dueDate = new Date(Date.now() + investment.duration * 24 * 60 * 60 * 1000);
    investment.repaymentAmount = investment.amount + (investment.amount * investment.interestRate / 100);
    investment.remainingBalance = investment.repaymentAmount;
    
    await investment.save();

    // Send real-time notification
    if (global.io) {
      global.io.to(`user_${investment.borrower._id}`).emit('investment_funded', {
        investmentId: investment._id,
        amount: investment.amount,
        investor: investor.name
      });
    }

    res.json({
      message: 'Investment funded successfully',
      investment: {
        id: investment._id,
        amount: investment.amount,
        status: investment.status,
        fundedAt: investment.fundedAt,
        dueDate: investment.dueDate,
        repaymentAmount: investment.repaymentAmount
      }
    });
  } catch (error) {
    console.error('Fund investment error:', error);
    res.status(500).json({ error: 'Failed to fund investment' });
  }
});

// New: Batch operations for gas efficiency
router.post('/batch-update', authenticateToken, async (req, res) => {
  try {
    const { investmentId, verificationStatus, riskScore } = req.body;
    
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.borrower.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this investment' });
    }

    const algodClient = req.app.locals.algodClient;
    const suggestedParams = await algodClient.getTransactionParams().do();

    const batchUpdateTxn = algosdk.makeApplicationCallTxnFromObject({
      from: investment.borrower.walletAddress,
      appIndex: investment.app_id,
      suggestedParams,
      appArgs: [
        new Uint8Array(Buffer.from('batch')),
        new Uint8Array(Buffer.from(verificationStatus || 'pending')),
        algosdk.encodeUint64(riskScore || 50)
      ]
    });

    res.json({
      message: 'Batch update transaction created',
      unsignedTransaction: Buffer.from(algosdk.encodeUnsignedTransaction(batchUpdateTxn)).toString('base64')
    });
  } catch (error) {
    console.error('Batch update error:', error);
    res.status(500).json({ error: 'Failed to create batch update transaction' });
  }
});

// New: Emergency withdrawal for investors
router.post('/emergency-withdrawal', authenticateToken, async (req, res) => {
  try {
    const { investmentId } = req.body;
    
    const investment = await Investment.findById(investmentId).populate('investor');
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (investment.investor._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to withdraw from this investment' });
    }

    if (investment.status !== 'active') {
      return res.status(400).json({ error: 'Investment is not active' });
    }

    // Check if 30 days have passed since funding
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (investment.fundedAt > thirtyDaysAgo) {
      return res.status(400).json({ error: 'Emergency withdrawal only available after 30 days' });
    }

    const algodClient = req.app.locals.algodClient;
    const suggestedParams = await algodClient.getTransactionParams().do();

    const emergencyWithdrawalTxn = algosdk.makeApplicationCallTxnFromObject({
      from: investment.investor.walletAddress,
      appIndex: investment.app_id,
      suggestedParams,
      appArgs: [
        new Uint8Array(Buffer.from('emergency'))
      ]
    });

    res.json({
      message: 'Emergency withdrawal transaction created',
      unsignedTransaction: Buffer.from(algosdk.encodeUnsignedTransaction(emergencyWithdrawalTxn)).toString('base64')
    });
  } catch (error) {
    console.error('Emergency withdrawal error:', error);
    res.status(500).json({ error: 'Failed to create emergency withdrawal transaction' });
  }
});

router.get('/explore', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;
    
    const investments = await Investment.find({ status })
      .populate('borrower', 'profile reputationScore')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Investment.countDocuments({ status });

    res.json({
      investments: investments.map(inv => ({
        id: inv._id,
        amount: inv.amount,
        purpose: inv.purpose,
        description: inv.description,
        interestRate: inv.interestRate,
        duration: inv.duration,
        status: inv.status,
        createdAt: inv.createdAt,
        borrower: {
          name: inv.borrower.profile.name,
          location: inv.borrower.profile.location,
          reputationScore: inv.borrower.reputationScore
        }
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Explore investments error:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

router.get('/my-investments', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    const myInvestments = await Investment.find({
      $or: [
        { borrower: user._id },
        { investor: user._id }
      ]
    }).populate('borrower investor', 'profile reputationScore');

    res.json({
      investments: myInvestments.map(inv => ({
        id: inv._id,
        amount: inv.amount,
        purpose: inv.purpose,
        description: inv.description,
        interestRate: inv.interestRate,
        duration: inv.duration,
        status: inv.status,
        createdAt: inv.createdAt,
        role: inv.borrower._id.toString() === user._id.toString() ? 'borrower' : 'investor',
        borrower: inv.borrower ? {
          name: inv.borrower.profile.name,
          location: inv.borrower.profile.location,
          reputationScore: inv.borrower.reputationScore
        } : null,
        investor: inv.investor ? {
          name: inv.investor.profile.name,
          location: inv.investor.profile.location,
          reputationScore: inv.investor.reputationScore
        } : null
      }))
    });
  } catch (error) {
    console.error('My investments error:', error);
    res.status(500).json({ error: 'Failed to fetch user investments' });
  }
});

// Helper function to generate repayment schedule
function generateRepaymentSchedule(amount, interestRate, duration) {
  const totalInterest = (amount * interestRate / 100);
  const totalRepayment = amount + totalInterest;
  const dailyRepayment = totalRepayment / duration;
  
  const schedule = [];
  for (let i = 1; i <= duration; i++) {
    schedule.push({
      day: i,
      amount: dailyRepayment,
      dueDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
    });
  }
  
  return schedule;
}

// Helper function to get investment approval program
function getInvestmentApprovalProgram() {
  // This would typically load from a compiled contract file
  return process.env.INVESTMENT_APPROVAL_PROGRAM || 'base64_encoded_program';
}

// Helper function to get investment clear program
function getInvestmentClearProgram() {
  // This would typically load from a compiled contract file
  return process.env.INVESTMENT_CLEAR_PROGRAM || 'base64_encoded_program';
}

module.exports = router;