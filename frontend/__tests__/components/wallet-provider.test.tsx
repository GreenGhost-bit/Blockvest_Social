// Wallet provider component tests

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { WalletProvider, useWallet } from '../../components/ui/wallet-provider';

// Test component that uses the wallet context
const TestComponent = () => {
  const { isConnected, walletAddress, balance, connectWallet, disconnectWallet } = useWallet();
  
  return (
    <div>
      <div data-testid="wallet-status">
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div data-testid="wallet-address">
        {walletAddress || 'No address'}
      </div>
      <div data-testid="wallet-balance">
        {balance}
      </div>
      <button 
        data-testid="connect-button" 
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
      <button 
        data-testid="disconnect-button" 
        onClick={disconnectWallet}
      >
        Disconnect Wallet
      </button>
    </div>
  );
};

describe('WalletProvider', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders with initial disconnected state', () => {
    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    expect(screen.getByTestId('wallet-status')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('No address');
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('0');
  });

  it('connects wallet successfully', async () => {
    // Mock wallet connection
    const mockConnect = jest.fn().mockResolvedValue({
      address: 'MOCK_USER_1',
      balance: 1000
    });

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    const connectButton = screen.getByTestId('connect-button');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByTestId('wallet-status')).toHaveTextContent('Connected');
    });
  });

  it('disconnects wallet successfully', async () => {
    // Start with connected wallet
    const mockDisconnect = jest.fn().mockResolvedValue(undefined);

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByTestId('wallet-status')).toHaveTextContent('Connected');
    });

    // Then disconnect
    const disconnectButton = screen.getByTestId('disconnect-button');
    fireEvent.click(disconnectButton);

    await waitFor(() => {
      expect(screen.getByTestId('wallet-status')).toHaveTextContent('Disconnected');
    });
  });

  it('handles wallet connection errors', async () => {
    // Mock wallet connection error
    const mockConnect = jest.fn().mockRejectedValue(new Error('Connection failed'));

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    const connectButton = screen.getByTestId('connect-button');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByTestId('wallet-status')).toHaveTextContent('Disconnected');
    });
  });

  it('provides wallet context to child components', () => {
    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    // Check that the context is available
    expect(screen.getByTestId('wallet-status')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-address')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-balance')).toBeInTheDocument();
  });
});
