'use client';

import React, { useState, useEffect } from 'react';
import { 
  WalletIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface WalletInfo {
  address: string;
  balance: number;
  network: string;
  isConnected: boolean;
}

interface WalletConnectProps {
  onConnect?: (walletInfo: WalletInfo) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  onError
}) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [error, setError] = useState<string>('');

  const supportedWallets = [
    {
      id: 'myalgo',
      name: 'MyAlgo',
      description: 'Connect with MyAlgo wallet',
      icon: '🔐',
      url: 'https://wallet.myalgo.com/'
    },
    {
      id: 'algosigner',
      name: 'AlgoSigner',
      description: 'Browser extension wallet',
      icon: '🔌',
      url: 'https://algosigner.com/'
    },
    {
      id: 'pera',
      name: 'Pera Wallet',
      description: 'Mobile wallet app',
      icon: '📱',
      url: 'https://perawallet.app/'
    }
  ];

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check for existing wallet connection
      const connectedWallet = localStorage.getItem('connectedWallet');
      if (connectedWallet) {
        const walletData = JSON.parse(connectedWallet);
        if (walletData.address && walletData.isConnected) {
          setWalletInfo(walletData);
          if (onConnect) {
            onConnect(walletData);
          }
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async (walletType: string) => {
    try {
      setIsConnecting(true);
      setError('');
      setSelectedWallet(walletType);

      let walletAddress = '';
      let walletBalance = 0;

      // Mock wallet connection - replace with actual wallet integration
      if (walletType === 'myalgo') {
        // Simulate MyAlgo connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        walletAddress = 'ALGO' + Math.random().toString(36).substr(2, 58).toUpperCase();
        walletBalance = Math.random() * 1000;
      } else if (walletType === 'algosigner') {
        // Simulate AlgoSigner connection
        await new Promise(resolve => setTimeout(resolve, 1500));
        walletAddress = 'ALGO' + Math.random().toString(36).substr(2, 58).toUpperCase();
        walletBalance = Math.random() * 1000;
      } else if (walletType === 'pera') {
        // Simulate Pera Wallet connection
        await new Promise(resolve => setTimeout(resolve, 2500));
        walletAddress = 'ALGO' + Math.random().toString(36).substr(2, 58).toUpperCase();
        walletBalance = Math.random() * 1000;
      }

      const newWalletInfo: WalletInfo = {
        address: walletAddress,
        balance: walletBalance,
        network: 'testnet', // or mainnet
        isConnected: true
      };

      setWalletInfo(newWalletInfo);
      localStorage.setItem('connectedWallet', JSON.stringify(newWalletInfo));
      
      if (onConnect) {
        onConnect(newWalletInfo);
      }

      setShowModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setWalletInfo(null);
      localStorage.removeItem('connectedWallet');
      
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const copyAddress = async () => {
    if (walletInfo?.address) {
      try {
        await navigator.clipboard.writeText(walletInfo.address);
        // Show temporary success message
        const originalText = 'Copy Address';
        const button = document.getElementById('copy-address-btn');
        if (button) {
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  const getNetworkColor = (network: string) => {
    return network === 'mainnet' ? 'text-green-600' : 'text-yellow-600';
  };

  const getNetworkIcon = (network: string) => {
    return network === 'mainnet' ? (
      <CheckCircleIcon className="h-4 w-4 text-green-600" />
    ) : (
      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
    );
  };

  if (walletInfo?.isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
        >
          <WalletIcon className="h-5 w-5" />
          <span className="font-medium">Connected</span>
          <span className="text-sm opacity-75">
            {formatAddress(walletInfo.address)}
          </span>
        </button>

        {/* Wallet Info Modal */}
        {showModal && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Wallet Connected</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                      {walletInfo.address}
                    </code>
                    <button
                      id="copy-address-btn"
                      onClick={copyAddress}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance
                  </label>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatBalance(walletInfo.balance)} ALGO
                  </div>
                </div>

                {/* Network */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Network
                  </label>
                  <div className="flex items-center space-x-2">
                    {getNetworkIcon(walletInfo.network)}
                    <span className={`text-sm font-medium ${getNetworkColor(walletInfo.network)}`}>
                      {walletInfo.network.charAt(0).toUpperCase() + walletInfo.network.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={disconnectWallet}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {showModal && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <WalletIcon className="h-5 w-5" />
        <span>Connect Wallet</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>

      {/* Wallet Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Connect Wallet</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Choose your preferred Algorand wallet to connect
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                {supportedWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => connectWallet(wallet.id)}
                    disabled={isConnecting}
                    className={`w-full p-4 border rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors ${
                      isConnecting && selectedWallet === wallet.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200'
                    } ${isConnecting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                        <p className="text-sm text-gray-600">{wallet.description}</p>
                      </div>
                      {isConnecting && selectedWallet === wallet.id && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Don't have a wallet?{' '}
                  <a
                    href="https://developer.algorand.org/docs/get-details/wallets/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
