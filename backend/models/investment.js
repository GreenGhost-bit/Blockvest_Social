const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    unique: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'defaulted'],
    default: 'pending'
  },
  repaymentSchedule: [{
    amount: Number,
    dueDate: Date,
    paid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    transactionId: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  fundedAt: Date,
  completedAt: Date,
  documents: [{
    type: String,
    url: String
  }]
});

module.exports = mongoose.model('Investment', investmentSchema);