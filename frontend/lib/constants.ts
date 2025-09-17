// Application constants and configuration

export const APP_CONFIG = {
  name: 'Blockvest Social',
  version: '1.0.0',
  description: 'A decentralized social investment platform',
  author: 'Blockvest Team',
  website: 'https://blockvestsocial.com',
  supportEmail: 'support@blockvestsocial.com',
};

export const API_ENDPOINTS = {
  base: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  auth: {
    connectWallet: '/auth/connect-wallet',
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
  },
  users: {
    profile: '/users/profile',
    dashboard: '/users/dashboard',
    reputation: '/users/reputation',
  },
  investments: {
    create: '/investments/create',
    explore: '/investments/explore',
    myInvestments: '/investments/my-investments',
    fund: '/investments/fund',
    repay: '/investments/repay',
  },
  smartContracts: {
    deploy: '/smart-contracts/deploy',
    call: '/smart-contracts/call',
    status: '/smart-contracts/status',
  },
  notifications: {
    list: '/notifications',
    markRead: '/notifications/mark-read',
    markAllRead: '/notifications/mark-all-read',
  },
  governance: {
    proposals: '/governance/proposals',
    create: '/governance/create',
    vote: '/governance/vote',
  },
  documents: {
    upload: '/documents/upload',
    list: '/documents',
    verify: '/documents/verify',
  },
  analytics: {
    dashboard: '/analytics/dashboard',
    metrics: '/analytics/metrics',
  },
};

export const WALLET_CONFIG = {
  algorand: {
    testnet: {
      algodServer: 'https://testnet-api.algonode.cloud',
      indexerServer: 'https://testnet-idx.algonode.cloud',
      algodToken: '',
      indexerToken: '',
    },
    mainnet: {
      algodServer: 'https://mainnet-api.algonode.cloud',
      indexerServer: 'https://mainnet-idx.algonode.cloud',
      algodToken: '',
      indexerToken: '',
    },
  },
  supportedWallets: ['Pera Wallet', 'MyAlgo Wallet', 'AlgoSigner'],
  minBalance: 0.1, // Minimum ALGO balance required
};

export const INVESTMENT_CONFIG = {
  minAmount: 100,
  maxAmount: 100000,
  minInterestRate: 1,
  maxInterestRate: 50,
  minDuration: 1, // months
  maxDuration: 60, // months
  defaultInterestRate: 8.5,
  defaultDuration: 12,
  supportedCurrencies: ['ALGO', 'USDC', 'USDT'],
  statuses: {
    pending: 'pending',
    funded: 'funded',
    active: 'active',
    completed: 'completed',
    defaulted: 'defaulted',
    cancelled: 'cancelled',
  },
};

export const REPUTATION_CONFIG = {
  levels: {
    bronze: { min: 0, max: 20, color: '#CD7F32' },
    silver: { min: 21, max: 40, color: '#C0C0C0' },
    gold: { min: 41, max: 60, color: '#FFD700' },
    platinum: { min: 61, max: 80, color: '#E5E4E2' },
    diamond: { min: 81, max: 100, color: '#B9F2FF' },
  },
  scoreFactors: {
    successfulInvestments: 10,
    onTimeRepayments: 5,
    lateRepayments: -2,
    defaultedInvestments: -10,
    verification: 15,
    socialActivity: 3,
  },
  maxScore: 100,
  minScore: 0,
};

export const NOTIFICATION_CONFIG = {
  types: {
    investment: 'investment',
    payment: 'payment',
    system: 'system',
    security: 'security',
  },
  maxUnread: 100,
  autoMarkReadDelay: 5000, // 5 seconds
};

export const GOVERNANCE_CONFIG = {
  votingPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  quorumThreshold: 100, // Minimum votes required
  majorityThreshold: 51, // Percentage for majority
  proposalStatuses: {
    draft: 'draft',
    active: 'active',
    passed: 'passed',
    rejected: 'rejected',
    expired: 'expired',
  },
};

export const DOCUMENT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  verificationStatuses: {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    expired: 'expired',
  },
  requiredDocuments: ['identity', 'address', 'income'],
};

export const SECURITY_CONFIG = {
  passwordMinLength: 8,
  passwordRequirements: {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  mfaRequired: true,
};

export const UI_CONFIG = {
  theme: {
    default: 'light',
    supported: ['light', 'dark'],
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
};

export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'You do not have permission to access this resource.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  server: 'A server error occurred. Please try again later.',
  timeout: 'The request timed out. Please try again.',
  wallet: 'Failed to connect wallet. Please try again.',
  insufficientFunds: 'Insufficient funds for this transaction.',
  transactionFailed: 'Transaction failed. Please try again.',
  smartContract: 'Smart contract execution failed. Please try again.',
  documentUpload: 'Failed to upload document. Please try again.',
  verification: 'Verification failed. Please check your documents and try again.',
};

export const SUCCESS_MESSAGES = {
  walletConnected: 'Wallet connected successfully!',
  walletDisconnected: 'Wallet disconnected successfully!',
  investmentCreated: 'Investment created successfully!',
  investmentFunded: 'Investment funded successfully!',
  paymentSent: 'Payment sent successfully!',
  documentUploaded: 'Document uploaded successfully!',
  documentVerified: 'Document verified successfully!',
  profileUpdated: 'Profile updated successfully!',
  proposalCreated: 'Proposal created successfully!',
  voteCast: 'Vote cast successfully!',
  notificationMarked: 'Notification marked as read!',
  settingsUpdated: 'Settings updated successfully!',
};

export const LOADING_MESSAGES = {
  connecting: 'Connecting to wallet...',
  loading: 'Loading...',
  processing: 'Processing...',
  saving: 'Saving...',
  uploading: 'Uploading...',
  verifying: 'Verifying...',
  voting: 'Casting vote...',
  creating: 'Creating...',
  updating: 'Updating...',
  deleting: 'Deleting...',
};

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  walletAddress: /^[A-Z2-7]{58}$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

export const DATE_FORMATS = {
  short: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm',
  iso: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
};

export const CURRENCY_FORMATS = {
  USD: {
    symbol: '$',
    code: 'USD',
    decimals: 2,
  },
  ALGO: {
    symbol: 'ALGO',
    code: 'ALGO',
    decimals: 6,
  },
  USDC: {
    symbol: 'USDC',
    code: 'USDC',
    decimals: 6,
  },
  USDT: {
    symbol: 'USDT',
    code: 'USDT',
    decimals: 6,
  },
};

export const FEATURE_FLAGS = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  enableRiskAssessment: process.env.NEXT_PUBLIC_ENABLE_RISK_ASSESSMENT === 'true',
  enableSocialFeatures: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES === 'true',
  enableReputationSystem: process.env.NEXT_PUBLIC_ENABLE_REPUTATION_SYSTEM === 'true',
  enableDarkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
  enableMFA: process.env.NEXT_PUBLIC_ENABLE_MFA === 'true',
  enableGovernance: process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true',
  enableMarketplace: process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === 'true',
};

export default {
  APP_CONFIG,
  API_ENDPOINTS,
  WALLET_CONFIG,
  INVESTMENT_CONFIG,
  REPUTATION_CONFIG,
  NOTIFICATION_CONFIG,
  GOVERNANCE_CONFIG,
  DOCUMENT_CONFIG,
  SECURITY_CONFIG,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  VALIDATION_RULES,
  DATE_FORMATS,
  CURRENCY_FORMATS,
  FEATURE_FLAGS,
};
