const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.userType === 'customer';
    }
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: function() {
      return this.userType === 'driver';
    }
  },
  userType: {
    type: String,
    enum: ['customer', 'driver'],
    required: true
  },
  transactionType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['topup', 'ride_payment', 'ride_earning', 'withdrawal', 'commission', 'refund'],
    required: true
  },
  relatedRide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    default: null
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayPalTransaction',
    default: null
  },
  relatedWithdrawal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WithdrawalRequest',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ driver: 1, createdAt: -1 });
walletTransactionSchema.index({ userType: 1, createdAt: -1 });
walletTransactionSchema.index({ category: 1, createdAt: -1 });
walletTransactionSchema.index({ status: 1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

module.exports = WalletTransaction;
