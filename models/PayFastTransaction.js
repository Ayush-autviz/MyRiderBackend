const mongoose = require('mongoose');

const payFastTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  pfPaymentId: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'ZAR',
    enum: ['ZAR', 'USD', 'EUR', 'GBP']
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'complete', 'cancelled', 'failed'],
    default: 'created'
  },
  paymentData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  itnData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  walletTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  signature: {
    type: String,
    required: true
  },
  // Additional PayFast specific fields
  itemName: {
    type: String,
    default: 'Wallet Top-up'
  },
  itemDescription: {
    type: String,
    default: 'MyRider wallet top-up'
  },
  nameFirst: {
    type: String,
    default: ''
  },
  nameLast: {
    type: String,
    default: ''
  },
  emailAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better query performance
payFastTransactionSchema.index({ user: 1, createdAt: -1 });
payFastTransactionSchema.index({ paymentId: 1 });
payFastTransactionSchema.index({ pfPaymentId: 1 });
payFastTransactionSchema.index({ status: 1 });

const PayFastTransaction = mongoose.model('PayFastTransaction', payFastTransactionSchema);

module.exports = PayFastTransaction; 