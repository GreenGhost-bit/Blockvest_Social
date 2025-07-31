import { useState, useEffect, useCallback } from 'react';
import algosdk from 'algosdk';

interface AccountInfo {
  address: string;
  balance: number;
  assets: any[];
  applications: any[];
  createdApps: any[];
}

interface Investment {
  appId: number;
  amount: number;
  purpose: string;
  interestRate: number;
  duration: number;
  status: string;
  borrower: string;
  investor?: string;
  fundedAt?: number;
  repaymentAmount?: number;
  riskScore?: number;
  verificationStatus?: string;
  createdAt?: number;
}

interface Transaction {
  txId: string;
  appId?: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

export const useBlockchain = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if MyAlgo wallet is available
      if (typeof window !== 'undefined' && (window as any).AlgoSigner) {
        const algoSigner = (window as any).AlgoSigner;
        await algoSigner.connect();
        const accounts = await algoSigner.accounts({
          ledger: 'TestNet'
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          return accounts[0].address;
        }
      }
      
      // Fallback to creating a new account
      const newAccount = algosdk.generateAccount();
      setAccount(newAccount.addr);
      return newAccount.addr;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get account information
  const getAccountInfo = useCallback(async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blockchain/account/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch account information');
      }
      
      const data = await response.json();
      setAccountInfo(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get account info';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create investment
  const createInvestment = useCallback(async (
    amount: number,
    purpose: string,
    interestRate: number,
    duration: number,
    description?: string
  ): Promise<Transaction> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!account) {
        throw new Error('No wallet connected');
      }
      
      const response = await fetch('/api/investments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          purpose,
          interestRate,
          duration,
          description,
          borrowerAddress: account
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create investment');
      }
      
      const data = await response.json();
      return {
        txId: data.txId,
        appId: data.appId,
        status: 'pending',
        timestamp: Date.now()
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create investment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Fund investment
  const fundInvestment = useCallback(async (
    appId: number,
    amount: number,
    borrowerAddress: string
  ): Promise<Transaction> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!account) {
        throw new Error('No wallet connected');
      }
      
      const response = await fetch('/api/investments/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId,
          amount,
          investorAddress: account,
          borrowerAddress
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fund investment');
      }
      
      const data = await response.json();
      return {
        txId: data.txId,
        appId: data.appId,
        status: 'pending',
        timestamp: Date.now()
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fund investment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Make repayment
  const makeRepayment = useCallback(async (
    appId: number,
    amount: number,
    investorAddress: string
  ): Promise<Transaction> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!account) {
        throw new Error('No wallet connected');
      }
      
      const response = await fetch('/api/investments/repay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId,
          amount,
          borrowerAddress: account,
          investorAddress
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to make repayment');
      }
      
      const data = await response.json();
      return {
        txId: data.txId,
        appId: data.appId,
        status: 'pending',
        timestamp: Date.now()
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to make repayment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Get investment details
  const getInvestmentDetails = useCallback(async (appId: number): Promise<Investment> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/investments/${appId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch investment details');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get investment details';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user investments
  const getUserInvestments = useCallback(async (address: string): Promise<Investment[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/investments/user/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user investments');
      }
      
      const data = await response.json();
      return data.investments || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user investments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get available investments
  const getAvailableInvestments = useCallback(async (): Promise<Investment[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/investments/available');
      if (!response.ok) {
        throw new Error('Failed to fetch available investments');
      }
      
      const data = await response.json();
      return data.investments || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get available investments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check transaction status
  const checkTransactionStatus = useCallback(async (txId: string): Promise<'pending' | 'confirmed' | 'failed'> => {
    try {
      const response = await fetch(`/api/blockchain/transaction/${txId}`);
      if (!response.ok) {
        return 'failed';
      }
      
      const data = await response.json();
      return data.status || 'pending';
    } catch (err) {
      return 'failed';
    }
  }, []);

  // Convert microAlgos to Algos
  const microAlgosToAlgos = useCallback((microAlgos: number): number => {
    return microAlgos / 1000000;
  }, []);

  // Convert Algos to microAlgos
  const algosToMicroAlgos = useCallback((algos: number): number => {
    return algos * 1000000;
  }, []);

  // Validate Algorand address
  const isValidAddress = useCallback((address: string): boolean => {
    try {
      return algosdk.isValidAddress(address);
    } catch {
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setAccountInfo(null);
    setError(null);
  }, []);

  // Load account info when account changes
  useEffect(() => {
    if (account) {
      getAccountInfo(account);
    }
  }, [account, getAccountInfo]);

  return {
    account,
    accountInfo,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    getAccountInfo,
    createInvestment,
    fundInvestment,
    makeRepayment,
    getInvestmentDetails,
    getUserInvestments,
    getAvailableInvestments,
    checkTransactionStatus,
    microAlgosToAlgos,
    algosToMicroAlgos,
    isValidAddress,
    clearError
  };
}; 