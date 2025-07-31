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
  }

  // Create a new account
  async createAccount() {
    try {
      const account = algosdk.generateAccount();
      logger.info('New Algorand account created', { address: account.addr });
      return {
        address: account.addr,
        privateKey: algosdk.secretKeyToMnemonic(account.sk),
        publicKey: account.addr
      };
    } catch (error) {
      logger.error('Failed to create Algorand account', { error: error.message });
      throw new BlockchainError('Failed to create account', null);
    }
  }

  // Get account information
  async getAccountInfo(address) {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return {
        address: accountInfo.address,
        balance: accountInfo.amount,
        assets: accountInfo.assets || [],
        applications: accountInfo['apps-local-state'] || [],
        createdApps: accountInfo['created-apps'] || []
      };
    } catch (error) {
      logger.error('Failed to get account info', { address, error: error.message });
      throw new BlockchainError('Failed to get account information', null);
    }
  }

  // Create and deploy smart contract
  async deployContract(creatorPrivateKey, approvalProgram, clearProgram, globalSchema, localSchema) {
    try {
      const creator = algosdk.mnemonicToSecretKey(creatorPrivateKey);
      
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
      
      // Submit transaction
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Smart contract deployed successfully', { 
        appId: confirmedTxn['application-index'],
        txId 
      });
      
      return {
        appId: confirmedTxn['application-index'],
        txId,
        address: creator.addr
      };
    } catch (error) {
      logger.error('Failed to deploy smart contract', { error: error.message });
      throw new BlockchainError('Failed to deploy smart contract', null);
    }
  }

  // Create investment transaction
  async createInvestment(creatorPrivateKey, appId, amount, purpose, interestRate, duration) {
    try {
      const creator = algosdk.mnemonicToSecretKey(creatorPrivateKey);
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from(amount.toString())),
        new Uint8Array(Buffer.from(purpose)),
        new Uint8Array(Buffer.from(interestRate.toString())),
        new Uint8Array(Buffer.from(duration.toString()))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: creator.addr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        suggestedParams
      });

      const signedTxn = txn.signTxn(creator.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      const confirmedTxn = await this.waitForConfirmation(txId);
      
      logger.info('Investment created successfully', { appId, txId });
      
      return { txId, appId };
    } catch (error) {
      logger.error('Failed to create investment', { error: error.message });
      throw new BlockchainError('Failed to create investment', null);
    }
  }

  // Fund investment
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
      
      logger.info('Investment funded successfully', { appId, txId });
      
      return { txId, appId };
    } catch (error) {
      logger.error('Failed to fund investment', { error: error.message });
      throw new BlockchainError('Failed to fund investment', null);
    }
  }

  // Make repayment
  async makeRepayment(borrowerPrivateKey, appId, amount, investorAddress) {
    try {
      const borrower = algosdk.mnemonicToSecretKey(borrowerPrivateKey);
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: borrower.addr,
        to: investorAddress,
        amount: amount * 1000000, // Convert to microAlgos
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
      
      logger.info('Repayment made successfully', { appId, txId });
      
      return { txId, appId };
    } catch (error) {
      logger.error('Failed to make repayment', { error: error.message });
      throw new BlockchainError('Failed to make repayment', null);
    }
  }

  // Get application state
  async getApplicationState(appId) {
    try {
      const appInfo = await this.algodClient.getApplicationByID(appId).do();
      return {
        appId: appInfo.id,
        creator: appInfo.params.creator,
        globalState: appInfo.params['global-state'] || [],
        localState: appInfo.params['local-state'] || []
      };
    } catch (error) {
      logger.error('Failed to get application state', { appId, error: error.message });
      throw new BlockchainError('Failed to get application state', null);
    }
  }

  // Wait for transaction confirmation
  async waitForConfirmation(txId, timeout = 10) {
    try {
      const status = await algosdk.waitForConfirmation(this.algodClient, txId, timeout);
      return status;
    } catch (error) {
      logger.error('Transaction confirmation timeout', { txId, error: error.message });
      throw new BlockchainError('Transaction confirmation failed', txId);
    }
  }

  // Get transaction details
  async getTransaction(txId) {
    try {
      const txInfo = await this.indexerClient.lookupTransactionByID(txId).do();
      return txInfo.transaction;
    } catch (error) {
      logger.error('Failed to get transaction details', { txId, error: error.message });
      throw new BlockchainError('Failed to get transaction details', txId);
    }
  }

  // Get account transactions
  async getAccountTransactions(address, limit = 100) {
    try {
      const response = await this.indexerClient.searchForTransactions()
        .address(address)
        .limit(limit)
        .do();
      return response.transactions;
    } catch (error) {
      logger.error('Failed to get account transactions', { address, error: error.message });
      throw new BlockchainError('Failed to get account transactions', null);
    }
  }

  // Check if address is valid
  isValidAddress(address) {
    try {
      return algosdk.isValidAddress(address);
    } catch (error) {
      return false;
    }
  }

  // Convert microAlgos to Algos
  microAlgosToAlgos(microAlgos) {
    return microAlgos / 1000000;
  }

  // Convert Algos to microAlgos
  algosToMicroAlgos(algos) {
    return algos * 1000000;
  }
}

module.exports = new BlockchainService(); 