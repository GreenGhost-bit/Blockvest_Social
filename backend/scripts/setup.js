#!/usr/bin/env node

const mongoose = require('mongoose');
const User = require('../models/User');
const Investment = require('../models/Investment');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockvest_social', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create indexes
    console.log('📊 Creating database indexes...');
    await User.createIndexes();
    await Investment.createIndexes();
    console.log('✅ Database indexes created');

    // Create sample data if in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌱 Creating sample data...');
      await createSampleData();
      console.log('✅ Sample data created');
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

async function createSampleData() {
  // Create sample users
  const sampleUsers = [
    {
      walletAddress: 'MOCK_USER_1',
      profile: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        location: 'New York, NY',
        phone: '+1-555-0123'
      },
      reputationScore: 85,
      isVerified: true,
      totalInvested: 5000,
      totalBorrowed: 2000
    },
    {
      walletAddress: 'MOCK_USER_2',
      profile: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        location: 'San Francisco, CA',
        phone: '+1-555-0456'
      },
      reputationScore: 72,
      isVerified: true,
      totalInvested: 3000,
      totalBorrowed: 1500
    },
    {
      walletAddress: 'MOCK_USER_3',
      profile: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        location: 'Austin, TX',
        phone: '+1-555-0789'
      },
      reputationScore: 90,
      isVerified: true,
      totalInvested: 8000,
      totalBorrowed: 1000
    }
  ];

  for (const userData of sampleUsers) {
    const existingUser = await User.findOne({ walletAddress: userData.walletAddress });
    if (!existingUser) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.profile.name}`);
    }
  }

  // Create sample investments
  const users = await User.find({});
  if (users.length >= 2) {
    const sampleInvestments = [
      {
        amount: 1000,
        purpose: 'Business Expansion',
        description: 'Looking to expand my local bakery business by opening a second location. This will help me serve more customers and create additional jobs in the community.',
        interestRate: 8.5,
        duration: 180,
        borrower: users[0]._id,
        status: 'pending',
        riskScore: 65
      },
      {
        amount: 2500,
        purpose: 'Education',
        description: 'Funding my master\'s degree in computer science to advance my career in software development.',
        interestRate: 6.0,
        duration: 365,
        borrower: users[1]._id,
        status: 'pending',
        riskScore: 45
      },
      {
        amount: 500,
        purpose: 'Emergency Fund',
        description: 'Unexpected medical expenses require immediate funding. I have a stable job and can repay within 6 months.',
        interestRate: 12.0,
        duration: 90,
        borrower: users[2]._id,
        status: 'pending',
        riskScore: 80
      }
    ];

    for (const investmentData of sampleInvestments) {
      const existingInvestment = await Investment.findOne({ 
        borrower: investmentData.borrower,
        purpose: investmentData.purpose 
      });
      if (!existingInvestment) {
        const investment = new Investment(investmentData);
        await investment.save();
        console.log(`Created investment: ${investmentData.purpose}`);
      }
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, createSampleData };
