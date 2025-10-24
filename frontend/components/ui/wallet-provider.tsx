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
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        setLoading(true);
        setError(null);
        setConnectionStatus('connecting');

        if (typeof window !== 'undefined' && 'algorand' in window) {
          const algorand = (window as any).algorand;
          
          // Check if wallet is already connected
          if (algorand.isConnected && algorand.isConnected()) {
            const accounts = await algorand.getAccounts();
            if (accounts && accounts.length > 0) {
              const address = accounts[0];
              setWalletAddress(address);
              setIsConnected(true);
              setConnectionStatus('connected');
              
              // Skip authentication if already connected
              const token = localStorage.getItem('token');
              if (token) {
                await Promise.all([
                  fetchBalance(address),
                  fetchAssets(),
                  fetchTransactions()
                ]);
                return;
              }
            }
          }
          
          const accounts = await algorand.enable();
          const address = accounts[0];
          
          if (!address) {
            throw new Error('No wallet address received');
          }
          
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
            return; // Success, exit retry loop
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Authentication failed (${response.status})`);
          }
        } else {
          throw new Error('No Algorand wallet found. Please install Pera Wallet or similar.');
        }
      } catch (err) {
        retryCount++;
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
        
        if (retryCount >= maxRetries) {
          setError(`${errorMessage} (Attempt ${retryCount}/${maxRetries})`);
          setIsConnected(false);
          setWalletAddress(null);
          setUser(null);
          setBalance(0);
          setAssets([]);
          setTransactions([]);
          setPendingTransactions([]);
          setConnectionStatus('error');
          
          // Clear localStorage on final failure
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('isConnected');
            localStorage.removeItem('network');
          }
          
          console.error('Wallet connection error after retries:', err);
        } else {
          console.warn(`Wallet connection attempt ${retryCount} failed:`, errorMessage);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      } finally {
        if (retryCount >= maxRetries) {
          setLoading(false);
        }
      }
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
      if (!isConnected || typeof window === 'undefined' || !('algorand' in window)) {
        throw new Error('Wallet not connected');
      }

      const algorand = (window as any).algorand;
      const signedTxn = await algorand.signTransaction(transaction);
      
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
      
      // Wait for confirmation with timeout
      const confirmation = await algosdk.waitForConfirmation(algodClient, response.txId, 10);
      
      if (confirmation['confirmed-round']) {
        setPendingTransactions(prev => prev.filter(tx => tx.id !== response.txId));
        setTransactions(prev => [{
          ...newTransaction,
          status: 'confirmed',
          timestamp: confirmation['confirmed-round'] * 1000 // Convert round to timestamp
        }, ...prev]);
        await fetchBalance(walletAddress!);
        return response.txId;
      } else {
        // Mark transaction as failed
        setPendingTransactions(prev => prev.filter(tx => tx.id !== response.txId));
        setTransactions(prev => [{
          ...newTransaction,
          status: 'failed'
        }, ...prev]);
        throw new Error('Transaction failed to confirm');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to send transaction');
    }
  }, [isConnected, walletAddress, algodClient]);

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
      const balanceInAlgos = accountInfo.amount / 1000000; // Convert microAlgos to Algos
      setBalance(balanceInAlgos);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      // Don't set balance to 0 on error, keep previous value
      if (err instanceof Error && err.message.includes('not found')) {
        setBalance(0);
      }
    }
  }, [algodClient]);

  const fetchAssets = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      const accountAssets = await indexerClient.lookupAccountAssets(walletAddress).do();
      
      if (!accountAssets.assets || accountAssets.assets.length === 0) {
        setAssets([]);
        return;
      }
      
      const assetDetails = await Promise.all(
        accountAssets.assets.map(async (asset: any) => {
          try {
            const assetInfo = await indexerClient.lookupAssetByID(asset.assetId).do();
            return {
              id: asset.assetId,
              name: assetInfo.asset.params.name || 'Unknown Asset',
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
      setAssets([]);
    }
  }, [walletAddress, indexerClient]);

  const fetchTransactions = useCallback(async (limit: number = 50) => {
    if (!walletAddress) return;
    
    try {
      const response = await indexerClient.searchForTransactions()
        .address(walletAddress)
        .limit(limit)
        .do();
      
      if (!response.transactions || response.transactions.length === 0) {
        setTransactions([]);
        return;
      }
      
      const formattedTransactions: Transaction[] = response.transactions.map((tx: any) => {
        const amount = tx.amount || tx['payment-transaction']?.amount || tx['asset-transfer-transaction']?.amount || 0;
        const receiver = tx['payment-transaction']?.receiver || tx['asset-transfer-transaction']?.receiver || '';
        
        return {
          id: tx.id,
          type: tx['tx-type'] as Transaction['type'],
          amount: amount,
          assetId: tx['asset-transfer-transaction']?.assetId,
          from: tx.sender,
          to: receiver,
          fee: tx.fee,
          timestamp: tx['round-time'] * 1000,
          status: 'confirmed',
          note: tx.note ? new TextDecoder().decode(tx.note) : undefined
        };
      });
      
      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactions([]);
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
    if (!NETWORKS[network]) {
      throw new Error(`Unsupported network: ${network}`);
    }
    
    const newNetworkConfig = NETWORKS[network];
    
    // Update network configuration
    setNetworkConfig(newNetworkConfig);
    
    // If currently connected, disconnect and reconnect with new network
    if (isConnected) {
      await disconnectWallet();
      
      // Update stored network preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('network', network);
      }
      
      // Attempt to reconnect with new network
      try {
        await connectWallet();
      } catch (err) {
        console.warn('Failed to reconnect after network switch:', err);
      }
    } else {
      // Just update the stored preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('network', network);
      }
    }
  }, [isConnected, disconnectWallet, connectWallet]);

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
        .then(response => {
          if (!response.ok) {
            throw new Error('Invalid token');
          }
          return response.json();
        })
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
        .catch((error) => {
          console.warn('Token validation failed:', error);
          localStorage.removeItem('token');
          setConnectionStatus('disconnected');
        });
    }
  }, [fetchBalance, fetchAssets, fetchTransactions]);

  // Add mock wallet for development with better simulation
  const connectMockWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');

      // Create a mock wallet address for development
      const mockAddress = 'MOCK' + Math.random().toString(36).substr(2, 9);
      
      setWalletAddress(mockAddress);
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Create mock user data with more realistic values
      const mockUser = {
        id: 'mock-user-id',
        walletAddress: mockAddress,
        profile: {
          name: 'Mock User',
          email: 'mock@example.com',
          location: 'Test Location',
          phone: '+1234567890'
        },
        reputationScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        isVerified: true,
        preferences: {
          notifications: { email: true, push: true, sms: false },
          privacy: { profile_public: true, investment_history_public: false, risk_score_public: false },
          investment: { min_amount: 0.001, max_amount: 1000, preferred_risk_level: 'medium' }
        }
      };
      
      setUser(mockUser);
      setBalance(Math.random() * 1000 + 100); // Random balance between 100-1100
      setAssets([]);
      setTransactions([]);
      
      // Store mock token
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('network', networkConfig.name.toLowerCase());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect mock wallet';
      setError(errorMessage);
      setIsConnected(false);
      setWalletAddress(null);
      setConnectionStatus('error');
      console.error('Mock wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [networkConfig]);

  const value: WalletContextType = {
    isConnected,
    walletAddress,
    user,
    balance,
    assets,
    transactions,
    pendingTransactions,
    networkConfig,
    connectWallet: typeof window !== 'undefined' && 'algorand' in window ? connectWallet : connectMockWallet,
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