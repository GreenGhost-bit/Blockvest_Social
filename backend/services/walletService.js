const algosdk = require('algosdk');
const crypto = require('crypto');

class WalletService {
  constructor() {
    this.network = process.env.ALGORAND_NETWORK || 'testnet';
    this.algodClient = null;
    this.indexerClient = null;
    this.kmdClient = null;
    this.initializeClients();
  }

  initializeClients() {
    try {
      if (this.network === 'mainnet') {
        this.algodClient = new algosdk.Algodv2(
          process.env.ALGOD_TOKEN || '',
          process.env.ALGOD_SERVER || 'https://mainnet-api.algonode.cloud',
          process.env.ALGOD_PORT || 443
        );
        this.indexerClient = new algosdk.Indexer(
          process.env.INDEXER_TOKEN || '',
          process.env.INDEXER_SERVER || 'https://mainnet-idx.algonode.cloud',
          process.env.INDEXER_PORT || 443
        );
      } else {
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
    } catch (error) {
      console.error('Error initializing Algorand clients:', error);
    }
  }

  async getAccountInfo(address) {
    try {
      if (!this.algodClient) {
        throw new Error('Algorand client not initialized');
      }

      const accountInfo = await this.algodClient.accountInformation(address).do();
      return {
        address: accountInfo.address,
        amount: accountInfo.amount,
        amountWithoutPendingRewards: accountInfo.amountWithoutPendingRewards,
        pendingRewards: accountInfo.pendingRewards,
        rewards: accountInfo.rewards,
        round: accountInfo.round,
        status: accountInfo.status,
        totalAssetsOptedIn: accountInfo.totalAssetsOptedIn,
        totalCreatedAssets: accountInfo.totalCreatedAssets,
        totalCreatedApps: accountInfo.totalCreatedApps
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  async getAccountAssets(address) {
    try {
      if (!this.indexerClient) {
        throw new Error('Indexer client not initialized');
      }

      const assets = await this.indexerClient.lookupAccountAssets(address).do();
      return assets.assets.map(asset => ({
        assetId: asset.assetId,
        amount: asset.amount,
        isFrozen: asset.isFrozen,
        optedInAtRound: asset.optedInAtRound,
        optedOutAtRound: asset.optedOutAtRound,
        deleted: asset.deleted,
        creator: asset.creator,
        decimals: asset.decimals,
        name: asset.name,
        unitName: asset.unitName,
        url: asset.url
      }));
    } catch (error) {
      console.error('Error getting account assets:', error);
      throw error;
    }
  }

  async getAccountTransactions(address, limit = 100) {
    try {
      if (!this.indexerClient) {
        throw new Error('Indexer client not initialized');
      }

      const transactions = await this.indexerClient.searchForTransactions()
        .address(address)
        .limit(limit)
        .do();

      return transactions.transactions.map(tx => ({
        id: tx.id,
        round: tx.confirmedRound,
        timestamp: tx.roundTime,
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        fee: tx.fee,
        type: tx.txType,
        status: tx.confirmedRound ? 'confirmed' : 'pending'
      }));
    } catch (error) {
      console.error('Error getting account transactions:', error);
      throw error;
    }
  }

  async getTransactionDetails(txId) {
    try {
      if (!this.indexerClient) {
        throw new Error('Indexer client not initialized');
      }

      const transaction = await this.indexerClient.lookupTransaction(txId).do();
      return {
        id: transaction.transaction.id,
        round: transaction.transaction.confirmedRound,
        timestamp: transaction.transaction.roundTime,
        sender: transaction.transaction.sender,
        receiver: transaction.transaction.receiver,
        amount: transaction.transaction.amount,
        fee: transaction.transaction.fee,
        type: transaction.transaction.txType,
        status: transaction.transaction.confirmedRound ? 'confirmed' : 'pending',
        note: transaction.transaction.note ? 
          Buffer.from(transaction.transaction.note, 'base64').toString() : null
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  }

  async getAssetInfo(assetId) {
    try {
      if (!this.indexerClient) {
        throw new Error('Indexer client not initialized');
      }

      const asset = await this.indexerClient.lookupAssetByID(assetId).do();
      return {
        assetId: asset.asset.index,
        name: asset.asset.params.name,
        unitName: asset.asset.params.unitName,
        total: asset.asset.params.total,
        decimals: asset.asset.params.decimals,
        creator: asset.asset.params.creator,
        manager: asset.asset.params.manager,
        reserve: asset.asset.params.reserve,
        freeze: asset.asset.params.freeze,
        clawback: asset.asset.params.clawback,
        url: asset.asset.params.url,
        metadataHash: asset.asset.params.metadataHash
      };
    } catch (error) {
      console.error('Error getting asset info:', error);
      throw error;
    }
  }

  async getNetworkStatus() {
    try {
      if (!this.algodClient) {
        throw new Error('Algorand client not initialized');
      }

      const status = await this.algodClient.status().do();
      return {
        lastRound: status.lastRound,
        lastVersion: status.lastVersion,
        genesisHash: status.genesisHash,
        genesisId: status.genesisId,
        catchupTime: status.catchupTime,
        timeSinceLastRound: status.timeSinceLastRound,
        network: this.network
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      throw error;
    }
  }

  async getSuggestedParams() {
    try {
      if (!this.algodClient) {
        throw new Error('Algorand client not initialized');
      }

      const params = await this.algodClient.getTransactionParams().do();
      return {
        fee: params.fee,
        firstValid: params.firstValid,
        lastValid: params.lastValid,
        genesisHash: params.genesisHash,
        genesisId: params.genesisId,
        minFee: params.minFee
      };
    } catch (error) {
      console.error('Error getting suggested params:', error);
      throw error;
    }
  }

  async validateAddress(address) {
    try {
      return algosdk.isValidAddress(address);
    } catch (error) {
      return false;
    }
  }

  async generateWallet() {
    try {
      const account = algosdk.generateAccount();
      return {
        address: account.addr,
        privateKey: Buffer.from(account.sk).toString('base64'),
        mnemonic: algosdk.secretKeyToMnemonic(account.sk)
      };
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw error;
    }
  }

  async importWalletFromMnemonic(mnemonic) {
    try {
      const privateKey = algosdk.mnemonicToSecretKey(mnemonic);
      return {
        address: privateKey.addr,
        privateKey: Buffer.from(privateKey.sk).toString('base64'),
        mnemonic: mnemonic
      };
    } catch (error) {
      console.error('Error importing wallet from mnemonic:', error);
      throw error;
    }
  }

  async importWalletFromPrivateKey(privateKeyBase64) {
    try {
      const privateKey = Buffer.from(privateKeyBase64, 'base64');
      const account = algosdk.mnemonicToSecretKey(
        algosdk.secretKeyToMnemonic(privateKey)
      );
      return {
        address: account.addr,
        privateKey: privateKeyBase64,
        mnemonic: algosdk.secretKeyToMnemonic(account.sk)
      };
    } catch (error) {
      console.error('Error importing wallet from private key:', error);
      throw error;
    }
  }

  async signTransaction(transaction, privateKeyBase64) {
    try {
      const privateKey = Buffer.from(privateKeyBase64, 'base64');
      const signedTx = transaction.signTxn(privateKey);
      return signedTx;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  async sendTransaction(signedTransaction) {
    try {
      if (!this.algodClient) {
        throw new Error('Algorand client not initialized');
      }

      const txId = await this.algodClient.sendRawTransaction(signedTransaction).do();
      return { txId, status: 'submitted' };
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  async waitForConfirmation(txId, maxRounds = 1000) {
    try {
      if (!this.algodClient) {
        throw new Error('Algorand client not initialized');
      }

      const confirmation = await algosdk.waitForConfirmation(
        this.algodClient,
        txId,
        maxRounds
      );
      return {
        txId,
        confirmedRound: confirmation.confirmedRound,
        status: 'confirmed'
      };
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw error;
    }
  }

  async getAccountBalance(address) {
    try {
      const accountInfo = await this.getAccountInfo(address);
      return {
        address,
        balance: accountInfo.amount,
        balanceInAlgos: accountInfo.amount / 1000000,
        pendingRewards: accountInfo.pendingRewards,
        totalRewards: accountInfo.rewards
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  async estimateTransactionFee(transaction) {
    try {
      const suggestedParams = await this.getSuggestedParams();
      const estimatedFee = Math.max(transaction.estimateSize() * suggestedParams.fee, suggestedParams.minFee);
      return estimatedFee;
    } catch (error) {
      console.error('Error estimating transaction fee:', error);
      throw error;
    }
  }

  async validateTransaction(transaction) {
    try {
      const suggestedParams = await this.getSuggestedParams();
      const currentRound = (await this.getNetworkStatus()).lastRound;
      
      const validation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      if (transaction.firstValid < currentRound) {
        validation.isValid = false;
        validation.errors.push('Transaction has expired');
      }

      if (transaction.lastValid < currentRound) {
        validation.isValid = false;
        validation.errors.push('Transaction has expired');
      }

      if (transaction.fee < suggestedParams.minFee) {
        validation.isValid = false;
        validation.errors.push('Transaction fee is below minimum');
      }

      if (transaction.amount < 0) {
        validation.isValid = false;
        validation.errors.push('Transaction amount cannot be negative');
      }

      return validation;
    } catch (error) {
      console.error('Error validating transaction:', error);
      throw error;
    }
  }

  async getAccountHistory(address, startRound = 0, endRound = null) {
    try {
      if (!this.indexerClient) {
        throw new Error('Indexer client not initialized');
      }

      let query = this.indexerClient.searchForTransactions()
        .address(address)
        .minRound(startRound);

      if (endRound) {
        query = query.maxRound(endRound);
      }

      const history = await query.limit(1000).do();
      
      return history.transactions.map(tx => ({
        id: tx.id,
        round: tx.confirmedRound,
        timestamp: tx.roundTime,
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        fee: tx.fee,
        type: tx.txType,
        status: 'confirmed'
      }));
    } catch (error) {
      console.error('Error getting account history:', error);
      throw error;
    }
  }
}

module.exports = WalletService;
