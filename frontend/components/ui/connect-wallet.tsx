'use client';

import React, { useState } from 'react';
import { useWallet } from './wallet-provider';

const ConnectWallet: React.FC = () => {
  const { isConnected, walletAddress, user, balance, connectWallet, disconnectWallet, loading, error } = useWallet();
  const [showProfile, setShowProfile] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Connecting wallet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-medium">Error:</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={connectWallet}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">
            Connect your Algorand wallet to start investing or borrowing on Blockvest Social
          </p>
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Supported wallets:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <span className="bg-gray-100 px-2 py-1 rounded">Pera Wallet</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Defly</span>
              <span className="bg-gray-100 px-2 py-1 rounded">MyAlgo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        <div className="bg-green-100 p-2 rounded-full">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {user?.profile.name || 'Connected Wallet'}
          </p>
          <p className="text-sm text-gray-600">{formatAddress(walletAddress!)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{formatBalance(balance)} ALGO</p>
          <p className="text-xs text-gray-600">Balance</p>
        </div>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showProfile && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {user?.profile.name ? user.profile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.profile.name || 'User'}</p>
                <p className="text-sm text-gray-600">Reputation: {user?.reputationScore || 0}/100</p>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Verification Status</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Wallet Address</span>
                <span className="text-sm font-mono text-gray-900">{formatAddress(walletAddress!)}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <button
                onClick={disconnectWallet}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;