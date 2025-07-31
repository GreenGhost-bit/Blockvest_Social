import React, { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';

const WalletConnect: React.FC = () => {
  const { 
    account, 
    accountInfo, 
    connectWallet, 
    disconnectWallet, 
    loading, 
    error, 
    clearError 
  } = useBlockchain();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatBalance = (balance: number) => {
    return (balance / 1000000).toFixed(4); // Convert microAlgos to Algos
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Connecting...</span>
      </div>
    );
  }

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            {formatAddress(account)}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Wallet</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono text-gray-900">{account}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(account)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {accountInfo && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Balance</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatBalance(accountInfo.balance)} ALGO
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Assets</p>
                    <p className="font-medium text-gray-900">{accountInfo?.assets?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Applications</p>
                    <p className="font-medium text-gray-900">{accountInfo?.applications?.length || 0}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={handleDisconnect}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleConnect}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Connect Wallet
      </button>
      
      {error && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-600">{error}</span>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 