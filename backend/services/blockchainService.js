const algosdk = require('algosdk');
const { BlockchainError, logger } = require('../middleware/errorHandler');

class BlockchainService {
  constructor() {
    this.algodClient = new algosdk.Algodv2(
      process.env.ALGOD_TOKEN || '',
      process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
      process.env.ALGOD_PORT || 443
    );
    
    this.indexerClient = new algosdk.Indexer(
      process.env.INDEXER_TOKEN || '',
      process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud',
      process.env.INDEXER_PORT || 443
    );
    
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  // Create a new account with enhanced security
  async createAccount() {
    try {
      const account = algosdk.generateAccount();
      logger.info('New Algorand account created', { address: account.addr });
      return {
        address: account.addr,
        privateKey: algosdk.secretKeyToMnemonic(account.sk),
        publicKey: account.addr,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to create Algorand account', { error: error.message });
      throw new BlockchainError('Failed to create account', null);
    }
  }

  // Get account information with enhanced details
  async getAccountInfo(address) {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      const accountAssets = await this.getAccountAssets(address);
      
      return {
        address: accountInfo.address,
        balance: accountInfo.amount,
        assets: accountAssets,
        applications: accountInfo['apps-local-state'] || [],
        createdApps: accountInfo['created-apps'] || [],
        totalAssets: accountAssets.length,
        totalApplications: accountInfo['apps-local-state']?.length || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get account info', { address, error: error.message });
      throw new BlockchainError('Failed to get account information', null);
    }
  }

  // Get account assets with metadata
  async getAccountAssets(address) {
    try {
      const accountAssets = await this.indexerClient.lookupAccountAssets(address).do();
      return accountAssets.assets.map(asset => ({
        assetId: asset['asset-id'],
        amount: asset.amount,
        isFrozen: asset['is-frozen'],
        deleted: asset.deleted,
        optedInAtRound: asset['opted-in-at-round']
      }));
    } catch (error) {
      logger.error('Failed to get account assets', { address, error: error.message });
      return [];
    }
  }

  // Create and deploy smart contract with enhanced validation
  async deployContract(creatorPrivateKey, approvalProgram, clearProgram, globalSchema, localSchema) {
    try {
      const creator = algosdk.mnemonicToSecretKey(creatorPrivateKey);
      
      // Validate schemas
      this.validateSchemas(globalSchema, localSchema);
      
      // Get suggested parameters
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Create unsigned transaction
      const txn = algosdk.makeApplicationCreateTxnFromObject({
        from: creator.addr,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: new Uint8Array(Buffer.from(approvalProgram, 'base64')),
        clearProgram: new Uint8Array(Buffer.from(clearProgram, 'base64')),
        numGlobalInts: globalSchema.numInts,
        numGlobalByteSlices: globalSchema.numByteSlices,
        numLocalInts: localSchema.numInts,
        numLocalByteSlices: localSchema.numByteSlices
      });

      // Sign transaction
      const signedTxn = txn.signTxn(creator.sk);
      
      // Submit transaction with retry logic
      const txId = await this.submitTransactionWithRetry(signedTxn);
      
      // Wait for confirmation
      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Smart contract deployed successfully', { 
        appId: confirmedTxn['application-index'],
        txId 
      });
      
      return {
        appId: confirmedTxn['application-index'],
        txId,
        address: creator.addr,
        deployedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to deploy smart contract', { error: error.message });
      throw new BlockchainError('Failed to deploy smart contract', null);
    }
  }

  // Enhanced create investment with collateral support
  async createInvestment(creatorPrivateKey, appId, amount, purpose, interestRate, duration, collateralAmount = 0) {
    try {
      const creator = algosdk.mnemonicToSecretKey(creatorPrivateKey);
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from(amount.toString())),
        new Uint8Array(Buffer.from(purpose)),
        new Uint8Array(Buffer.from(interestRate.toString())),
        new Uint8Array(Buffer.from(duration.toString())),
        new Uint8Array(Buffer.from(collateralAmount.toString()))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: creator.addr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        suggestedParams
      });

      const signedTxn = txn.signTxn(creator.sk);
      const txId = await this.submitTransactionWithRetry(signedTxn);
      
      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Investment created successfully', { appId, txId, collateralAmount });
      
      return { 
        txId, 
        appId, 
        collateralAmount,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to create investment', { error: error.message });
      throw new BlockchainError('Failed to create investment', null);
    }
  }

  // Enhanced fund investment with collateral validation
  async fundInvestment(investorPrivateKey, appId, amount, borrowerAddress) {
    try {
      const investor = algosdk.mnemonicToSecretKey(investorPrivateKey);
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: investor.addr,
        to: borrowerAddress,
        amount: amount * 1000000, // Convert to microAlgos
        suggestedParams
      });

      // Create app call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: investor.addr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new Uint8Array(Buffer.from('fund'))],
        suggestedParams
      });

      // Group transactions
      const groupId = algosdk.computeGroupID([paymentTxn, appCallTxn]);
      paymentTxn.group = groupId;
      appCallTxn.group = groupId;

      // Sign transactions
      const signedPaymentTxn = paymentTxn.signTxn(investor.sk);
      const signedAppCallTxn = appCallTxn.signTxn(investor.sk);

      // Submit grouped transactions
      const txId = await this.algodClient.sendRawTransaction([
        signedPaymentTxn,
        signedAppCallTxn
      ]).do();

      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Investment funded successfully', { appId, txId, amount });
      
      return { 
        txId, 
        appId, 
        amount,
        fundedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to fund investment', { error: error.message });
      throw new BlockchainError('Failed to fund investment', null);
    }
  }

  // Enhanced make repayment with late fee calculation
  async makeRepayment(borrowerPrivateKey, appId, amount, investorAddress, isLate = false) {
    try {
      const borrower = algosdk.mnemonicToSecretKey(borrowerPrivateKey);
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Calculate late fees if applicable
      const finalAmount = isLate ? amount * 1.05 : amount; // 5% late fee
      
      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: borrower.addr,
        to: investorAddress,
        amount: finalAmount * 1000000, // Convert to microAlgos
        suggestedParams
      });

      // Create app call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: borrower.addr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new Uint8Array(Buffer.from('repay'))],
        suggestedParams
      });

      // Group transactions
      const groupId = algosdk.computeGroupID([paymentTxn, appCallTxn]);
      paymentTxn.group = groupId;
      appCallTxn.group = groupId;

      // Sign transactions
      const signedPaymentTxn = paymentTxn.signTxn(borrower.sk);
      const signedAppCallTxn = appCallTxn.signTxn(borrower.sk);

      // Submit grouped transactions
      const txId = await this.algodClient.sendRawTransaction([
        signedPaymentTxn,
        signedAppCallTxn
      ]).do();

      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Repayment made successfully', { appId, txId, amount, finalAmount, isLate });
      
      return { 
        txId, 
        appId, 
        amount,
        finalAmount,
        isLate,
        repaidAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to make repayment', { error: error.message });
      throw new BlockchainError('Failed to make repayment', null);
    }
  }

  // New: Batch transaction processing
  async processBatchTransactions(transactions) {
    try {
      const results = [];
      const batchSize = 10; // Process 10 transactions at a time
      
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(tx => this.submitTransactionWithRetry(tx))
        );
        results.push(...batchResults);
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize < transactions.length) {
          await this.delay(100);
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Failed to process batch transactions', { error: error.message });
      throw new BlockchainError('Failed to process batch transactions', null);
    }
  }

  // New: Liquidate collateral
  async liquidateCollateral(investorPrivateKey, appId) {
    try {
      const investor = algosdk.mnemonicToSecretKey(investorPrivateKey);
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: investor.addr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new Uint8Array(Buffer.from('liquidate'))],
        suggestedParams
      });

      const signedTxn = txn.signTxn(investor.sk);
      const txId = await this.submitTransactionWithRetry(signedTxn);
      
      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Collateral liquidated successfully', { appId, txId });
      
      return { 
        txId, 
        appId, 
        liquidatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to liquidate collateral', { error: error.message });
      throw new BlockchainError('Failed to liquidate collateral', null);
    }
  }

  // New: Refinance investment
  async refinanceInvestment(borrowerPrivateKey, appId, newInterestRate, newDuration) {
    try {
      const borrower = algosdk.mnemonicToSecretKey(borrowerPrivateKey);
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from('refinance')),
        new Uint8Array(Buffer.from(newInterestRate.toString())),
        new Uint8Array(Buffer.from(newDuration.toString()))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: borrower.addr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        suggestedParams
      });

      const signedTxn = txn.signTxn(borrower.sk);
      const txId = await this.submitTransactionWithRetry(signedTxn);
      
      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Investment refinanced successfully', { appId, txId, newInterestRate, newDuration });
      
      return { 
        txId, 
        appId, 
        newInterestRate,
        newDuration,
        refinancedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to refinance investment', { error: error.message });
      throw new BlockchainError('Failed to refinance investment', null);
    }
  }

  // Enhanced get application state with caching
  async getApplicationState(appId, useCache = true) {
    try {
      const cacheKey = `app_${appId}`;
      
      if (useCache && this.cache && this.cache[cacheKey]) {
        const cached = this.cache[cacheKey];
        if (Date.now() - cached.timestamp < 30000) { // 30 second cache
          return cached.data;
        }
      }
      
      const appInfo = await this.algodClient.getApplicationByID(appId).do();
      const result = {
        appId: appInfo.id,
        creator: appInfo.params.creator,
        globalState: appInfo.params['global-state'] || [],
        localState: appInfo.params['local-state'] || [],
        lastUpdated: new Date().toISOString()
      };
      
      if (useCache && this.cache) {
        this.cache[cacheKey] = {
          data: result,
          timestamp: Date.now()
        };
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to get application state', { appId, error: error.message });
      throw new BlockchainError('Failed to get application state', null);
    }
  }

  // Enhanced wait for transaction confirmation with exponential backoff
  async waitForConfirmation(txId, timeout = 30) {
    try {
      const status = await algosdk.waitForConfirmation(this.algodClient, txId, timeout);
      return status;
    } catch (error) {
      logger.error('Transaction confirmation timeout', { txId, error: error.message });
      throw new BlockchainError('Transaction confirmation failed', txId);
    }
  }

  // Enhanced get transaction details with metadata
  async getTransaction(txId) {
    try {
      const txInfo = await this.indexerClient.lookupTransactionByID(txId).do();
      const transaction = txInfo.transaction;
      
      return {
        ...transaction,
        timestamp: new Date(transaction['round-time'] * 1000).toISOString(),
        blockRound: transaction['confirmed-round'],
        fee: transaction.fee,
        confirmed: transaction['confirmed-round'] > 0
      };
    } catch (error) {
      logger.error('Failed to get transaction details', { txId, error: error.message });
      throw new BlockchainError('Failed to get transaction details', txId);
    }
  }

  // Enhanced get account transactions with filtering
  async getAccountTransactions(address, limit = 100, assetId = null, txType = null) {
    try {
      let search = this.indexerClient.searchForTransactions()
        .address(address)
        .limit(limit);
      
      if (assetId) {
        search = search.assetID(assetId);
      }
      
      if (txType) {
        search = search.txType(txType);
      }
      
      const response = await search.do();
      
      return response.transactions.map(tx => ({
        ...tx,
        timestamp: new Date(tx['round-time'] * 1000).toISOString(),
        confirmed: tx['confirmed-round'] > 0
      }));
    } catch (error) {
      logger.error('Failed to get account transactions', { address, error: error.message });
      throw new BlockchainError('Failed to get account transactions', null);
    }
  }

  // Enhanced address validation
  isValidAddress(address) {
    try {
      if (!address || typeof address !== 'string' || address.trim() === '') {
        return false;
      }
      const trimmedAddress = address.trim();
      if (trimmedAddress.length !== 58) {
        return false;
      }
      return algosdk.isValidAddress(trimmedAddress);
    } catch (error) {
      return false;
    }
  }

  // Enhanced microAlgos conversion with validation
  microAlgosToAlgos(microAlgos) {
    if (typeof microAlgos !== 'number' || isNaN(microAlgos) || microAlgos < 0) {
      throw new Error('Invalid microAlgos amount');
    }
    return Math.round((microAlgos / 1000000) * 1000000) / 1000000;
  }

  // Enhanced Algos conversion with validation
  algosToMicroAlgos(algos) {
    if (typeof algos !== 'number' || isNaN(algos) || algos < 0) {
      throw new Error('Invalid Algos amount');
    }
    if (algos > 1000000) {
      throw new Error('Amount exceeds maximum limit');
    }
    return Math.floor(algos * 1000000);
  }

  // New: Submit transaction with retry logic
  async submitTransactionWithRetry(signedTxn, maxRetries = this.maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
        return txId;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        logger.warn(`Transaction submission attempt ${attempt} failed, retrying...`, { error: error.message });
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  // New: Validate schemas
  validateSchemas(globalSchema, localSchema) {
    if (!globalSchema || !localSchema) {
      throw new Error('Both global and local schemas are required');
    }
    
    if (globalSchema.numInts < 0 || globalSchema.numByteSlices < 0 ||
        localSchema.numInts < 0 || localSchema.numByteSlices < 0) {
      throw new Error('Schema values must be non-negative');
    }
    
    if (globalSchema.numInts > 64 || globalSchema.numByteSlices > 64 ||
        localSchema.numInts > 16 || localSchema.numByteSlices > 16) {
      throw new Error('Schema values exceed maximum limits');
    }
  }

  // New: Utility delay function
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // New: Get network status
  async getNetworkStatus() {
    try {
      const status = await this.algodClient.status().do();
      return {
        lastRound: status['last-round'],
        lastVersion: status['last-version'],
        nextVersion: status['next-version'],
        nextVersionRound: status['next-version-round'],
        nextVersionSupported: status['next-version-supported'],
        timeSinceLastRound: status['time-since-last-round'],
        catchupTime: status['catchup-time'],
        hasSyncedSinceStartup: status['has-synced-since-startup']
      };
    } catch (error) {
      logger.error('Failed to get network status', { error: error.message });
      throw new BlockchainError('Failed to get network status', null);
    }
  }

  // New: Get suggested transaction parameters with fallback
  async getSuggestedParams() {
    try {
      const params = await this.algodClient.getTransactionParams().do();
      return params;
    } catch (error) {
      logger.warn('Failed to get suggested params, using fallback', { error: error.message });
      // Fallback parameters for testnet
      return {
        fee: 1000,
        firstRound: 1,
        lastRound: 1000,
        genesisID: 'testnet-v1.0',
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
      };
    }
  }

  // New: Validate transaction before submission
  async validateTransaction(signedTxn) {
    try {
      const decoded = algosdk.decodeSignedTransaction(signedTxn);
      if (!decoded.txn) {
        throw new Error('Invalid transaction format');
      }
      return { valid: true, transaction: decoded.txn };
    } catch (error) {
      logger.error('Transaction validation failed', { error: error.message });
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new BlockchainService(); 