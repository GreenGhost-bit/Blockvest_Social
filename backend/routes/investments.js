const express = require('express');
const algosdk = require('algosdk');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { authenticateToken } = require('./auth');

const router = express.Router();

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { amount, purpose, description, interestRate, duration } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const algodClient = req.app.locals.algodClient;
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    
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
        algosdk.encodeUint64(amount),
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
      repaymentSchedule: generateRepaymentSchedule(amount, interestRate, duration)
    });

    await investment.save();

    res.json({
      message: 'Investment opportunity created',
      investment: {
        id: investment._id,
        amount: investment.amount,
        purpose: investment.purpose,
        description: investment.description,
        interestRate: investment.interestRate,
        duration: investment.duration,
        status: investment.status,
        createdAt: investment.createdAt
      },
      unsignedTransaction: Buffer.from(algosdk.encodeUnsignedTransaction(appCreateTxn)).toString('base64')
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ error: 'Failed to create investment opportunity' });
  }
});

router.post('/fund', authenticateToken, async (req, res) => {
  try {
    const { investmentId, transactionId } = req.body;
    
    const investment = await Investment.findById(investmentId).populate('borrower');
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const investor = await User.findById(req.user.userId);
    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    const indexerClient = req.app.locals.indexerClient;
    
    const txnInfo = await indexerClient.lookupTransactionByID(transactionId).do();
    
    if (txnInfo.transaction['payment-transaction'].amount !== investment.amount * 1000000) {
      return res.status(400).json({ error: 'Payment amount does not match investment amount' });
    }

    investment.investor = investor._id;
    investment.status = 'active';
    investment.fundedAt = new Date();
    await investment.save();

    investor.totalInvested += investment.amount;
    await investor.save();

    const borrower = await User.findById(investment.borrower);
    borrower.totalBorrowed += investment.amount;
    await borrower.save();

    res.json({
      message: 'Investment funded successfully',
      investment: {
        id: investment._id,
        status: investment.status,
        fundedAt: investment.fundedAt
      }
    });
  } catch (error) {
    console.error('Fund investment error:', error);
    res.status(500).json({ error: 'Failed to fund investment' });
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

function generateRepaymentSchedule(amount, interestRate, duration) {
  const schedule = [];
  const totalAmount = amount * (1 + interestRate / 100);
  const monthlyPayment = totalAmount / duration;
  
  for (let i = 1; i <= duration; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    
    schedule.push({
      amount: monthlyPayment,
      dueDate,
      paid: false
    });
  }
  
  return schedule;
}

function getInvestmentApprovalProgram() {
  return 'AiABASYCJgMSQAA7AQAiEkAANAEhBBJENAQiEkQ0AiEGEkQ0AyEHEkQoZEkiEkw0BCEFEjQAEUQ0AiEGEjQAEUQ0AyEHEjQAEUQiQw==';
}

function getInvestmentClearProgram() {
  return 'AiABASYCJgMSQAA7AQAiEkAANAEhBBJENAQiEkQ0AiEGEkQ0AyEHEkQoZEkiEkw0BCEFEjQAEUQ0AiEGEjQAEUQ0AyEHEjQAEUQiQw==';
}

module.exports = router;