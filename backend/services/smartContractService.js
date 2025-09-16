const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

class SmartContractService {
  constructor(algodClient, indexerClient) {
    this.algodClient = algodClient;
    this.indexerClient = indexerClient;
    this.contracts = new Map();
  }

  /**
   * Deploy investment contract
   */
  async deployInvestmentContract(creatorAccount) {
    try {
      // Read compiled TEAL
      const tealPath = path.join(__dirname, '../contracts/investment_contract.teal');
      let approvalProgram;
      
      if (fs.existsSync(tealPath)) {
        approvalProgram = fs.readFileSync(tealPath, 'utf8');
      } else {
        // Fallback: create a simple contract programmatically
        approvalProgram = this.createSimpleInvestmentContract();
      }

      // Create clear state program (simplified)
      const clearStateProgram = this.createClearStateProgram();

      // Get suggested parameters
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Create application creation transaction
      const txn = algosdk.makeApplicationCreateTxnFromObject({
        from: creatorAccount.addr,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: new Uint8Array(Buffer.from(approvalProgram)),
        clearProgram: new Uint8Array(Buffer.from(clearStateProgram)),
        numGlobalByteSlices: 10,
        numGlobalInts: 10,
        numLocalByteSlices: 0,
        numLocalInts: 0,
        appArgs: []
      });

      // Sign and send transaction
      const signedTxn = txn.signTxn(creatorAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();

      // Wait for confirmation
      const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
      const appId = result['application-index'];

      this.contracts.set('investment', {
        appId,
        address: algosdk.getApplicationAddress(appId),
        deployed: true
      });

      return {
        success: true,
        appId,
        address: algosdk.getApplicationAddress(appId),
        txId
      };
    } catch (error) {
      console.error('Error deploying investment contract:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deploy governance contract
   */
  async deployGovernanceContract(creatorAccount) {
    try {
      // Read compiled TEAL
      const tealPath = path.join(__dirname, '../contracts/governance_contract.teal');
      let approvalProgram;
      
      if (fs.existsSync(tealPath)) {
        approvalProgram = fs.readFileSync(tealPath, 'utf8');
      } else {
        // Fallback: create a simple contract programmatically
        approvalProgram = this.createSimpleGovernanceContract();
      }

      // Create clear state program (simplified)
      const clearStateProgram = this.createClearStateProgram();

      // Get suggested parameters
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Create application creation transaction
      const txn = algosdk.makeApplicationCreateTxnFromObject({
        from: creatorAccount.addr,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: new Uint8Array(Buffer.from(approvalProgram)),
        clearProgram: new Uint8Array(Buffer.from(clearStateProgram)),
        numGlobalByteSlices: 10,
        numGlobalInts: 10,
        numLocalByteSlices: 0,
        numLocalInts: 0,
        appArgs: []
      });

      // Sign and send transaction
      const signedTxn = txn.signTxn(creatorAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();

      // Wait for confirmation
      const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
      const appId = result['application-index'];

      this.contracts.set('governance', {
        appId,
        address: algosdk.getApplicationAddress(appId),
        deployed: true
      });

      return {
        success: true,
        appId,
        address: algosdk.getApplicationAddress(appId),
        txId
      };
    } catch (error) {
      console.error('Error deploying governance contract:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create investment on blockchain
   */
  async createInvestment(creatorAccount, investmentData) {
    try {
      const contract = this.contracts.get('investment');
      if (!contract) {
        throw new Error('Investment contract not deployed');
      }

      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Create application call transaction
      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: creatorAccount.addr,
        suggestedParams,
        appIndex: contract.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode('create'),
          new TextEncoder().encode(investmentData.id),
          algosdk.encodeUint64(investmentData.amount),
          algosdk.encodeUint64(investmentData.interestRate),
          algosdk.encodeUint64(investmentData.duration)
        ]
      });

      // Sign and send transaction
      const signedTxn = txn.signTxn(creatorAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();

      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      return {
        success: true,
        txId,
        appId: contract.appId
      };
    } catch (error) {
      console.error('Error creating investment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fund an investment
   */
  async fundInvestment(investorAccount, investmentId, amount) {
    try {
      const contract = this.contracts.get('investment');
      if (!contract) {
        throw new Error('Investment contract not deployed');
      }

      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Create payment transaction to contract
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: investorAccount.addr,
        to: contract.address,
        amount: amount,
        suggestedParams
      });

      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: investorAccount.addr,
        suggestedParams,
        appIndex: contract.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('fund')]
      });

      // Group transactions
      const groupTxn = algosdk.assignGroupID([paymentTxn, appCallTxn]);

      // Sign transactions
      const signedPaymentTxn = groupTxn[0].signTxn(investorAccount.sk);
      const signedAppCallTxn = groupTxn[1].signTxn(investorAccount.sk);

      // Send grouped transaction
      const txId = await this.algodClient.sendRawTransaction([
        signedPaymentTxn,
        signedAppCallTxn
      ]).do();

      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      return {
        success: true,
        txId
      };
    } catch (error) {
      console.error('Error funding investment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Make repayment
   */
  async makeRepayment(borrowerAccount, investmentId, amount) {
    try {
      const contract = this.contracts.get('investment');
      if (!contract) {
        throw new Error('Investment contract not deployed');
      }

      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Create payment transaction to contract
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: borrowerAccount.addr,
        to: contract.address,
        amount: amount,
        suggestedParams
      });

      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: borrowerAccount.addr,
        suggestedParams,
        appIndex: contract.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('repay')]
      });

      // Group transactions
      const groupTxn = algosdk.assignGroupID([paymentTxn, appCallTxn]);

      // Sign transactions
      const signedPaymentTxn = groupTxn[0].signTxn(borrowerAccount.sk);
      const signedAppCallTxn = groupTxn[1].signTxn(borrowerAccount.sk);

      // Send grouped transaction
      const txId = await this.algodClient.sendRawTransaction([
        signedPaymentTxn,
        signedAppCallTxn
      ]).do();

      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      return {
        success: true,
        txId
      };
    } catch (error) {
      console.error('Error making repayment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get contract state
   */
  async getContractState(appId) {
    try {
      const appInfo = await this.algodClient.getApplicationByID(appId).do();
      return {
        success: true,
        state: appInfo.params.globalState
      };
    } catch (error) {
      console.error('Error getting contract state:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create simple investment contract (fallback)
   */
  createSimpleInvestmentContract() {
    // This is a simplified TEAL contract for demonstration
    // In production, use the compiled Python contracts
    return `
#pragma version 6
txn ApplicationID
int 0
==
bnz main_l
txn OnCompletion
int NoOp
==
bnz handle_noop
txn OnCompletion
int OptIn
==
bnz handle_optin
txn OnCompletion
int CloseOut
==
bnz handle_closeout
txn OnCompletion
int UpdateApplication
==
bnz handle_update
txn OnCompletion
int DeleteApplication
==
bnz handle_delete
err

main_l:
  // On creation
  int 1
  return

handle_noop:
  // Handle application calls
  int 1
  return

handle_optin:
  int 1
  return

handle_closeout:
  int 1
  return

handle_update:
  int 1
  return

handle_delete:
  int 1
  return
`;
  }

  /**
   * Create simple governance contract (fallback)
   */
  createSimpleGovernanceContract() {
    // This is a simplified TEAL contract for demonstration
    return `
#pragma version 6
txn ApplicationID
int 0
==
bnz main_l
txn OnCompletion
int NoOp
==
bnz handle_noop
txn OnCompletion
int OptIn
==
bnz handle_optin
txn OnCompletion
int CloseOut
==
bnz handle_closeout
txn OnCompletion
int UpdateApplication
==
bnz handle_update
txn OnCompletion
int DeleteApplication
==
bnz handle_delete
err

main_l:
  // On creation
  int 1
  return

handle_noop:
  // Handle application calls
  int 1
  return

handle_optin:
  int 1
  return

handle_closeout:
  int 1
  return

handle_update:
  int 1
  return

handle_delete:
  int 1
  return
`;
  }

  /**
   * Create clear state program
   */
  createClearStateProgram() {
    return `
#pragma version 6
int 1
return
`;
  }

  /**
   * Get deployed contracts
   */
  getDeployedContracts() {
    return Array.from(this.contracts.entries()).map(([name, contract]) => ({
      name,
      ...contract
    }));
  }
}

module.exports = SmartContractService;
