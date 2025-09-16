const express = require('express');
const algosdk = require('algosdk');
const SmartContractService = require('../services/smartContractService');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Initialize smart contract service
let smartContractService;

// Initialize service when module loads
const initializeService = (req, res, next) => {
  if (!smartContractService) {
    smartContractService = new SmartContractService(
      req.app.locals.algodClient,
      req.app.locals.indexerClient
    );
  }
  req.smartContractService = smartContractService;
  next();
};

// Apply middleware to all routes
router.use(initializeService);

// Deploy investment contract
router.post('/deploy/investment', authenticateToken, async (req, res) => {
  try {
    const { privateKey } = req.body;
    
    if (!privateKey) {
      return res.status(400).json({ error: 'Private key is required' });
    }

    // Create account from private key
    const account = algosdk.mnemonicToSecretKey(privateKey);
    
    const result = await req.smartContractService.deployInvestmentContract(account);
    
    if (result.success) {
      res.json({
        message: 'Investment contract deployed successfully',
        appId: result.appId,
        address: result.address,
        txId: result.txId
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Deploy investment contract error:', error);
    res.status(500).json({ error: 'Failed to deploy investment contract' });
  }
});

// Deploy governance contract
router.post('/deploy/governance', authenticateToken, async (req, res) => {
  try {
    const { privateKey } = req.body;
    
    if (!privateKey) {
      return res.status(400).json({ error: 'Private key is required' });
    }

    // Create account from private key
    const account = algosdk.mnemonicToSecretKey(privateKey);
    
    const result = await req.smartContractService.deployGovernanceContract(account);
    
    if (result.success) {
      res.json({
        message: 'Governance contract deployed successfully',
        appId: result.appId,
        address: result.address,
        txId: result.txId
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Deploy governance contract error:', error);
    res.status(500).json({ error: 'Failed to deploy governance contract' });
  }
});

// Create investment on blockchain
router.post('/investment/create', authenticateToken, async (req, res) => {
  try {
    const { privateKey, investmentData } = req.body;
    
    if (!privateKey || !investmentData) {
      return res.status(400).json({ error: 'Private key and investment data are required' });
    }

    // Create account from private key
    const account = algosdk.mnemonicToSecretKey(privateKey);
    
    const result = await req.smartContractService.createInvestment(account, investmentData);
    
    if (result.success) {
      res.json({
        message: 'Investment created on blockchain successfully',
        txId: result.txId,
        appId: result.appId
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ error: 'Failed to create investment on blockchain' });
  }
});

// Fund investment
router.post('/investment/fund', authenticateToken, async (req, res) => {
  try {
    const { privateKey, investmentId, amount } = req.body;
    
    if (!privateKey || !investmentId || !amount) {
      return res.status(400).json({ error: 'Private key, investment ID, and amount are required' });
    }

    // Create account from private key
    const account = algosdk.mnemonicToSecretKey(privateKey);
    
    const result = await req.smartContractService.fundInvestment(account, investmentId, amount);
    
    if (result.success) {
      res.json({
        message: 'Investment funded successfully',
        txId: result.txId
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Fund investment error:', error);
    res.status(500).json({ error: 'Failed to fund investment' });
  }
});

// Make repayment
router.post('/investment/repay', authenticateToken, async (req, res) => {
  try {
    const { privateKey, investmentId, amount } = req.body;
    
    if (!privateKey || !investmentId || !amount) {
      return res.status(400).json({ error: 'Private key, investment ID, and amount are required' });
    }

    // Create account from private key
    const account = algosdk.mnemonicToSecretKey(privateKey);
    
    const result = await req.smartContractService.makeRepayment(account, investmentId, amount);
    
    if (result.success) {
      res.json({
        message: 'Repayment made successfully',
        txId: result.txId
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Make repayment error:', error);
    res.status(500).json({ error: 'Failed to make repayment' });
  }
});

// Get contract state
router.get('/state/:appId', authenticateToken, async (req, res) => {
  try {
    const { appId } = req.params;
    
    const result = await req.smartContractService.getContractState(parseInt(appId));
    
    if (result.success) {
      res.json({
        appId: parseInt(appId),
        state: result.state
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get contract state error:', error);
    res.status(500).json({ error: 'Failed to get contract state' });
  }
});

// Get deployed contracts
router.get('/deployed', authenticateToken, async (req, res) => {
  try {
    const contracts = req.smartContractService.getDeployedContracts();
    
    res.json({
      contracts
    });
  } catch (error) {
    console.error('Get deployed contracts error:', error);
    res.status(500).json({ error: 'Failed to get deployed contracts' });
  }
});

module.exports = router;
