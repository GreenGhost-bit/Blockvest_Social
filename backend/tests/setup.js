const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { logger } = require('../utils/logger');

let mongoServer;

// Setup test database
const setupTestDB = async () => {
  try {
    // Create in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to test database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false
    });
    
    logger.test('Test database connected successfully');
    
    // Create indexes for test models
    await mongoose.connection.db.collections();
    
  } catch (error) {
    logger.error('Failed to setup test database', { error: error.message });
    throw error;
  }
};

// Teardown test database
const teardownTestDB = async () => {
  try {
    // Disconnect from test database
    await mongoose.disconnect();
    
    // Stop in-memory MongoDB server
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    logger.test('Test database disconnected successfully');
    
  } catch (error) {
    logger.error('Failed to teardown test database', { error: error.message });
    throw error;
  }
};

// Clear test data
const clearTestData = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    logger.test('Test data cleared successfully');
    
  } catch (error) {
    logger.error('Failed to clear test data', { error: error.message });
    throw error;
  }
};

// Create test user data
const createTestUser = async (User) => {
  try {
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      full_name: 'Test User',
      wallet_address: 'A' + '2'.repeat(57), // Valid Algorand address format
      verified: true,
      verification_status: 'verified'
    });
    
    await testUser.save();
    logger.test('Test user created successfully');
    
    return testUser;
    
  } catch (error) {
    logger.error('Failed to create test user', { error: error.message });
    throw error;
  }
};

// Create test investment data
const createTestInvestment = async (Investment, User) => {
  try {
    const testUser = await User.findOne({ username: 'testuser' });
    
    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const testInvestment = new Investment({
      app_id: 1,
      tx_id: 'A' + '2'.repeat(51), // Valid transaction ID format
      amount: 100,
      purpose: 'Test investment purpose',
      description: 'Test investment description',
      interest_rate: 5,
      duration: 30,
      borrower: testUser._id,
      status: 'pending',
      category: 'business',
      tags: ['test', 'business']
    });
    
    await testInvestment.save();
    logger.test('Test investment created successfully');
    
    return testInvestment;
    
  } catch (error) {
    logger.error('Failed to create test investment', { error: error.message });
    throw error;
  }
};

// Create test risk assessment data
const createTestRiskAssessment = async (RiskAssessment, Investment) => {
  try {
    const testInvestment = await Investment.findOne({ purpose: 'Test investment purpose' });
    
    if (!testInvestment) {
      throw new Error('Test investment not found');
    }
    
    const testRiskAssessment = new RiskAssessment({
      investment: testInvestment._id,
      borrower: testInvestment.borrower,
      assessmentVersion: '1.0',
      overallRiskScore: 75,
      riskLevel: 'medium',
      riskFactors: [
        {
          factor: 'Credit Score',
          value: 750,
          weight: 0.3,
          score: 80
        },
        {
          factor: 'Income Stability',
          value: 'stable',
          weight: 0.4,
          score: 70
        },
        {
          factor: 'Payment History',
          value: 'good',
          weight: 0.3,
          score: 75
        }
      ],
      categoryScores: {
        creditworthiness: {
          score: 80,
          weight: 0.3,
          factors: ['Credit Score']
        },
        financial_stability: {
          score: 70,
          weight: 0.4,
          factors: ['Income Stability']
        },
        reputation_history: {
          score: 75,
          weight: 0.3,
          factors: ['Payment History']
        }
      },
      recommendations: [
        {
          type: 'conditional_approve',
          reasoning: 'Medium risk profile with good credit score',
          conditions: ['Provide additional income verification'],
          suggestedInterestRate: { min: 8, max: 12 },
          suggestedAmount: { min: 0.7, max: 0.9 }
        }
      ],
      assessedBy: 'algorithm'
    });
    
    await testRiskAssessment.save();
    logger.test('Test risk assessment created successfully');
    
    return testRiskAssessment;
    
  } catch (error) {
    logger.error('Failed to create test risk assessment', { error: error.message });
    throw error;
  }
};

// Create test notification data
const createTestNotification = async (Notification, User) => {
  try {
    const testUser = await User.findOne({ username: 'testuser' });
    
    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const testNotification = new Notification({
      recipient: testUser._id,
      type: 'investment_created',
      title: 'Test Notification',
      message: 'This is a test notification',
      priority: 'medium',
      category: 'investment'
    });
    
    await testNotification.save();
    logger.test('Test notification created successfully');
    
    return testNotification;
    
  } catch (error) {
    logger.error('Failed to create test notification', { error: error.message });
    throw error;
  }
};

// Create test MFA data
const createTestMFA = async (MFA, User) => {
  try {
    const testUser = await User.findOne({ username: 'testuser' });
    
    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const testMFA = new MFA({
      user: testUser._id,
      isEnabled: true,
      methods: {
        totp: {
          enabled: true,
          secret: 'A' + '2'.repeat(31), // Valid TOTP secret format
          backupCodes: [
            { code: 'A1B2C3D4', used: false },
            { code: 'E5F6G7H8', used: false }
          ]
        }
      },
      settings: {
        requireMFAForLogin: true,
        requireMFAForTransactions: true,
        requireMFAForHighValue: true,
        highValueThreshold: 1000,
        deviceTrustDuration: 30
      }
    });
    
    await testMFA.save();
    logger.test('Test MFA created successfully');
    
    return testMFA;
    
  } catch (error) {
    logger.error('Failed to create test MFA', { error: error.message });
    throw error;
  }
};

// Create test document data
const createTestDocument = async (Document, User) => {
  try {
    const testUser = await User.findOne({ username: 'testuser' });
    
    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const testDocument = new Document({
      user: testUser._id,
      type: 'government_id',
      fileName: 'test-document.pdf',
      originalName: 'test-document.pdf',
      filePath: '/uploads/test-document.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      fileHash: 'a'.repeat(64), // Valid SHA-256 hash format
      verificationStatus: 'pending'
    });
    
    await testDocument.save();
    logger.test('Test document created successfully');
    
    return testDocument;
    
  } catch (error) {
    logger.error('Failed to create test document', { error: error.message });
    throw error;
  }
};

// Mock JWT token for testing
const createMockJWT = (payload = {}) => {
  const defaultPayload = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    verified: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  
  const finalPayload = { ...defaultPayload, ...payload };
  
  // Simple mock JWT (not cryptographically secure, just for testing)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(finalPayload)).toString('base64');
  const signature = Buffer.from('test-signature').toString('base64');
  
  return `${header}.${body}.${signature}`;
};

// Mock request object for testing
const createMockRequest = (overrides = {}) => {
  const defaultRequest = {
    method: 'GET',
    url: '/api/test',
    originalUrl: '/api/test',
    path: '/api/test',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Jest Test Runner',
      'accept': 'application/json'
    },
    body: {},
    query: {},
    params: {},
    ip: '127.0.0.1',
    user: null,
    get: (header) => defaultRequest.headers[header.toLowerCase()],
    set: (header, value) => { defaultRequest.headers[header.toLowerCase()] = value; }
  };
  
  return { ...defaultRequest, ...overrides };
};

// Mock response object for testing
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.body = data;
      return res;
    },
    send: (data) => {
      res.body = data;
      return res;
    },
    setHeader: (name, value) => {
      res.headers[name] = value;
      return res;
    },
    getHeader: (name) => res.headers[name],
    removeHeader: (name) => {
      delete res.headers[name];
      return res;
    }
  };
  
  return res;
};

// Mock next function for testing
const createMockNext = () => {
  return jest.fn();
};

// Test utilities
const testUtils = {
  setupTestDB,
  teardownTestDB,
  clearTestData,
  createTestUser,
  createTestInvestment,
  createTestRiskAssessment,
  createTestNotification,
  createTestMFA,
  createTestDocument,
  createMockJWT,
  createMockRequest,
  createMockResponse,
  createMockNext
};

module.exports = testUtils;
