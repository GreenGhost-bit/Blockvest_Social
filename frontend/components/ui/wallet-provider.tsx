'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import algosdk from 'algosdk';

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
}

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  user: User | null;
  balance: number;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<string>;
  updateProfile: (profileData: any) => Promise<void>;
  loading: boolean;
  error: string | null;
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

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    443
  );

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window !== 'undefined' && 'algorand' in window) {
        const algorand = (window as any).algorand;
        
        const accounts = await algorand.enable();
        const address = accounts[0];
        
        setWalletAddress(address);
        setIsConnected(true);
        
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
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('token', data.token);
          await fetchBalance(address);
        } else {
          throw new Error('Authentication failed');
        }
      } else {
        throw new Error('No Algorand wallet found. Please install Pera Wallet or similar.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnected(false);
      setWalletAddress(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setUser(null);
    setBalance(0);
    localStorage.removeItem('token');
  };

  const signTransaction = async (transaction: any): Promise<string> => {
    if (!isConnected || typeof window === 'undefined' || !('algorand' in window)) {
      throw new Error('Wallet not connected');
    }

    const algorand = (window as any).algorand;
    const signedTxn = await algorand.signTransaction(transaction);
    return signedTxn.signature;
  };

  const updateProfile = async (profileData: any) => {
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
  };

  const fetchBalance = async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      setBalance(accountInfo.amount / 1000000);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
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
            fetchBalance(data.user.walletAddress);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  const value: WalletContextType = {
    isConnected,
    walletAddress,
    user,
    balance,
    connectWallet,
    disconnectWallet,
    signTransaction,
    updateProfile,
    loading,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};