'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import algosdk from 'algosdk';

interface Asset {
  id: number;
  name: string;
  unitName: string;
  decimals: number;
  totalSupply: number;
  balance: number;
  creator: string;
  frozen: boolean;
  clawback: boolean;
  manager: string;
  reserve: string;
  freeze: string;
}

interface Transaction {
  id: string;
  type: 'payment' | 'asset-transfer' | 'asset-opt-in' | 'application-call';
  amount: number;
  assetId?: number;
  from: string;
  to: string;
  fee: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  note?: string;
  groupId?: string;
}

interface User {
  id: string;
  walletAddress: string;
  profile: {
    name: string;
    email: string;
    location: string;
    phone: string;
  };
  reputationScore: number;
  isVerified: boolean;
  preferences: {
    defaultAsset: number;
    autoConfirm: boolean;
    gasEstimate: boolean;
  };
}

interface NetworkConfig {
  name: string;
  algodUrl: string;
  indexerUrl: string;
  explorerUrl: string;
  chainId: number;
}

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  user: User | null;
  balance: number;
  assets: Asset[];
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  networkConfig: NetworkConfig;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<string>;
  signTransactions: (transactions: any[]) => Promise<string[]>;
  sendTransaction: (transaction: any) => Promise<string>;
  sendTransactions: (transactions: any[]) => Promise<string[]>;
  updateProfile: (profileData: any) => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
  estimateGas: (transaction: any) => Promise<number>;
  switchNetwork: (network: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

const NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    name: 'Testnet',
    algodUrl: 'https://testnet-api.algonode.cloud',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    explorerUrl: 'https://testnet.algoexplorer.io',
    chainId: 416001
  },
  mainnet: {
    name: 'Mainnet',
    algodUrl: 'https://mainnet-api.algonode.cloud',
    indexerUrl: 'https://mainnet-idx.algonode.cloud',
    explorerUrl: 'https://algoexplorer.io',
    chainId: 416002
  },
  betanet: {
    name: 'Betanet',
    algodUrl: 'https://betanet-api.algonode.cloud',
    indexerUrl: 'https://betanet-idx.algonode.cloud',
    explorerUrl: 'https://betanet.algoexplorer.io',
    chainId: 416003
  }
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>(NETWORKS.testnet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const algodClient = new algosdk.Algodv2(
    '',
    networkConfig.algodUrl,
    443
  );

  const indexerClient = new algosdk.Indexer(
    '',
    networkConfig.indexerUrl,
    443
  );

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');

      if (typeof window !== 'undefined' && 'algorand' in window) {
        const algorand = (window as any).algorand;
        
        const accounts = await algorand.enable();
        const address = accounts[0];
        
        setWalletAddress(address);
        setIsConnected(true);
        setConnectionStatus('connected');
        
        const message = `Connect to Blockvest Social at ${Date.now()}`;
        const encodedMessage = new TextEncoder().encode(message);
        
        const signature = await algorand.signBytes(encodedMessage, address);
        
        const response = await fetch('/api/auth/connect-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address,
            signature: signature.signature,
            message: message,
            network: networkConfig.name.toLowerCase()
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('token', data.token);
          localStorage.setItem('network', networkConfig.name.toLowerCase());
          
          await Promise.all([
            fetchBalance(address),
            fetchAssets(),
            fetchTransactions()
          ]);
        } else {
          throw new Error('Authentication failed');
        }
      } else {
        throw new Error('No Algorand wallet found. Please install Pera Wallet or similar.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      setIsConnected(false);
      setWalletAddress(null);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, [networkConfig]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setUser(null);
    setBalance(0);
    setAssets([]);
    setTransactions([]);
    setPendingTransactions([]);
    setConnectionStatus('disconnected');
    localStorage.removeItem('token');
    localStorage.removeItem('network');
  }, []);

  const signTransaction = useCallback(async (transaction: any): Promise<string> => {
    if (!isConnected || typeof window === 'undefined' || !('algorand' in window)) {
      throw new Error('Wallet not connected');
    }

    const algorand = (window as any).algorand;
    const signedTxn = await algorand.signTransaction(transaction);
    return signedTxn.signature;
  }, [isConnected]);

  const signTransactions = useCallback(async (transactions: any[]): Promise<string[]> => {
    if (!isConnected || typeof window === 'undefined' || !('algorand' in window)) {
      throw new Error('Wallet not connected');
    }

    const algorand = (window as any).algorand;
    const signedTxns = await Promise.all(
      transactions.map(txn => algorand.signTransaction(txn))
    );
    return signedTxns.map(txn => txn.signature);
  }, [isConnected]);

  const sendTransaction = useCallback(async (transaction: any): Promise<string> => {
    try {
      const signedTxn = await signTransaction(transaction);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      
      const newTransaction: Transaction = {
        id: response.txId,
        type: 'payment',
        amount: transaction.amount || 0,
        from: walletAddress || '',
        to: transaction.to || '',
        fee: transaction.fee || 0,
        timestamp: Date.now(),
        status: 'pending',
        note: transaction.note
      };
      
      setPendingTransactions(prev => [...prev, newTransaction]);
      
      const confirmation = await algosdk.waitForConfirmation(algodClient, response.txId, 10);
      
      if (confirmation['confirmed-round']) {
        setPendingTransactions(prev => prev.filter(tx => tx.id !== response.txId));
        setTransactions(prev => [newTransaction, ...prev]);
        await fetchBalance(walletAddress!);
        return response.txId;
      } else {
        throw new Error('Transaction failed to confirm');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to send transaction');
    }
  }, [signTransaction, walletAddress, algodClient]);

  const sendTransactions = useCallback(async (transactions: any[]): Promise<string[]> => {
    try {
      const signedTxns = await signTransactions(transactions);
      const response = await algodClient.sendRawTransaction(signedTxns).do();
      
      const newTransactions: Transaction[] = transactions.map((txn, index) => ({
        id: response.txIds?.[index] || `group-${Date.now()}-${index}`,
        type: 'payment',
        amount: txn.amount || 0,
        from: walletAddress || '',
        to: txn.to || '',
        fee: txn.fee || 0,
        timestamp: Date.now(),
        status: 'pending',
        note: txn.note,
        groupId: response.txIds?.[0]
      }));
      
      setPendingTransactions(prev => [...prev, ...newTransactions]);
      
      const confirmations = await Promise.all(
        newTransactions.map(tx => 
          algosdk.waitForConfirmation(algodClient, tx.id, 10)
        )
      );
      
      const confirmedTxIds = confirmations
        .filter(conf => conf['confirmed-round'])
        .map((_, index) => newTransactions[index].id);
      
      setPendingTransactions(prev => prev.filter(tx => !confirmedTxIds.includes(tx.id)));
      setTransactions(prev => [...newTransactions, ...prev]);
      await fetchBalance(walletAddress!);
      
      return confirmedTxIds;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to send transactions');
    }
  }, [signTransactions, walletAddress, algodClient]);

  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  }, []);

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      setBalance(accountInfo.amount / 1000000);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, [algodClient]);

  const fetchAssets = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      const accountAssets = await indexerClient.lookupAccountAssets(walletAddress).do();
      const assetDetails = await Promise.all(
        accountAssets.assets.map(async (asset: any) => {
          try {
            const assetInfo = await indexerClient.lookupAssetByID(asset.assetId).do();
            return {
              id: asset.assetId,
              name: assetInfo.asset.params.name || 'Unknown',
              unitName: assetInfo.asset.params.unitName || '',
              decimals: assetInfo.asset.params.decimals || 0,
              totalSupply: assetInfo.asset.params.total || 0,
              balance: asset.amount,
              creator: assetInfo.asset.params.creator || '',
              frozen: assetInfo.asset.params.freeze || '',
              clawback: assetInfo.asset.params.clawback || '',
              manager: assetInfo.asset.params.manager || '',
              reserve: assetInfo.asset.params.reserve || '',
              freeze: assetInfo.asset.params.freeze || ''
            };
          } catch (err) {
            console.error(`Failed to fetch asset ${asset.assetId}:`, err);
            return null;
          }
        })
      );
      
      setAssets(assetDetails.filter(Boolean) as Asset[]);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  }, [walletAddress, indexerClient]);

  const fetchTransactions = useCallback(async (limit: number = 50) => {
    if (!walletAddress) return;
    
    try {
      const response = await indexerClient.searchForTransactions()
        .address(walletAddress)
        .limit(limit)
        .do();
      
      const formattedTransactions: Transaction[] = response.transactions.map((tx: any) => ({
        id: tx.id,
        type: tx['tx-type'] as Transaction['type'],
        amount: tx.amount || 0,
        assetId: tx['asset-transfer-transaction']?.assetId,
        from: tx.sender,
        to: tx['payment-transaction']?.receiver || tx['asset-transfer-transaction']?.receiver || '',
        fee: tx.fee,
        timestamp: tx['round-time'] * 1000,
        status: 'confirmed',
        note: tx.note ? new TextDecoder().decode(tx.note) : undefined
      }));
      
      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  }, [walletAddress, indexerClient]);

  const estimateGas = useCallback(async (transaction: any): Promise<number> => {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      return suggestedParams.fee;
    } catch (err) {
      console.error('Failed to estimate gas:', err);
      return 1000; // Default fee
    }
  }, [algodClient]);

  const switchNetwork = useCallback(async (network: string) => {
    if (NETWORKS[network]) {
      setNetworkConfig(NETWORKS[network]);
      if (isConnected) {
        await disconnectWallet();
      }
    }
  }, [isConnected, disconnectWallet]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedNetwork = localStorage.getItem('network');
    
    if (savedNetwork && NETWORKS[savedNetwork]) {
      setNetworkConfig(NETWORKS[savedNetwork]);
    }
    
    if (token) {
      fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setWalletAddress(data.user.walletAddress);
            setIsConnected(true);
            setConnectionStatus('connected');
            fetchBalance(data.user.walletAddress);
            fetchAssets();
            fetchTransactions();
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setConnectionStatus('disconnected');
        });
    }
  }, [fetchBalance, fetchAssets, fetchTransactions]);

  const value: WalletContextType = {
    isConnected,
    walletAddress,
    user,
    balance,
    assets,
    transactions,
    pendingTransactions,
    networkConfig,
    connectWallet,
    disconnectWallet,
    signTransaction,
    signTransactions,
    sendTransaction,
    sendTransactions,
    updateProfile,
    fetchAssets,
    fetchTransactions,
    estimateGas,
    switchNetwork,
    loading,
    error,
    connectionStatus,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};