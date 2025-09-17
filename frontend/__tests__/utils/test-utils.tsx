// Test utilities and helpers

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { WalletProvider } from '../../components/ui/wallet-provider';

// Mock wallet context
const mockWalletContext = {
  isConnected: false,
  walletAddress: null,
  balance: 0,
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  connectMockWallet: jest.fn(),
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockData = {
  user: {
    walletAddress: 'MOCK_USER_1',
    profile: {
      name: 'Test User',
      email: 'test@example.com',
      location: 'Test City, TC',
      phone: '+1-555-0123'
    },
    reputationScore: 85,
    isVerified: true,
    totalInvested: 5000,
    totalBorrowed: 2000
  },
  
  investment: {
    id: '1',
    amount: 1000,
    purpose: 'Test Investment',
    description: 'This is a test investment for testing purposes.',
    interestRate: 8.5,
    duration: 180,
    status: 'pending',
    createdAt: new Date().toISOString(),
    borrower: {
      name: 'Test Borrower',
      location: 'Test City, TC',
      reputationScore: 75
    }
  },
  
  notification: {
    id: '1',
    type: 'investment',
    title: 'Test Notification',
    message: 'This is a test notification message.',
    timestamp: new Date().toISOString(),
    read: false
  },
  
  proposal: {
    id: '1',
    title: 'Test Proposal',
    description: 'This is a test governance proposal.',
    creator: 'Test Creator',
    status: 'active',
    createdAt: new Date().toISOString(),
    votingStart: new Date().toISOString(),
    votingEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    yesVotes: 45,
    noVotes: 23,
    totalVotes: 68,
    quorumThreshold: 100,
    majorityThreshold: 51
  }
};

// Test helpers
export const testHelpers = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock API responses
  mockApiResponse: (data: any, status: number = 200) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  },
  
  // Mock API errors
  mockApiError: (message: string, status: number = 500) => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(message));
  },
  
  // Mock wallet connection
  mockWalletConnection: (address: string = 'MOCK_USER_1') => {
    mockWalletContext.isConnected = true;
    mockWalletContext.walletAddress = address;
    mockWalletContext.balance = 1000;
  },
  
  // Mock wallet disconnection
  mockWalletDisconnection: () => {
    mockWalletContext.isConnected = false;
    mockWalletContext.walletAddress = null;
    mockWalletContext.balance = 0;
  },
  
  // Generate test data
  generateTestData: (type: string, count: number = 5) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        ...mockData[type as keyof typeof mockData],
        id: `${i + 1}`,
        name: `Test ${type} ${i + 1}`,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return data;
  }
};

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (element: HTMLElement | null) => {
    return element !== null && element.ownerDocument === document;
  },
  
  toHaveTextContent: (element: HTMLElement, text: string) => {
    return element.textContent?.includes(text) || false;
  },
  
  toHaveClass: (element: HTMLElement, className: string) => {
    return element.classList.contains(className);
  }
};

// Test constants
export const testConstants = {
  TIMEOUTS: {
    SHORT: 100,
    MEDIUM: 500,
    LONG: 1000,
    VERY_LONG: 5000
  },
  
  SELECTORS: {
    LOADING: '[data-testid="loading"]',
    ERROR: '[data-testid="error"]',
    SUCCESS: '[data-testid="success"]',
    BUTTON: 'button',
    INPUT: 'input',
    FORM: 'form'
  },
  
  TEST_IDS: {
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success',
    WALLET_CONNECT: 'wallet-connect',
    WALLET_DISCONNECT: 'wallet-disconnect',
    INVESTMENT_CARD: 'investment-card',
    NOTIFICATION_ITEM: 'notification-item',
    PROPOSAL_CARD: 'proposal-card'
  }
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
