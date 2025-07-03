const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  profile: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    location: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    documents: [{
      type: String,
      url: String,
      verified: {
        type: Boolean,
        default: false
      }
    }]
  },
  reputationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalInvested: {
    type: Number,
    default: 0
  },
  totalBorrowed: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  userType: {
    type: String,
    enum: ['borrower', 'investor', 'both'],
    default: 'both'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);