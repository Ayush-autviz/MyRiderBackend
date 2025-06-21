const mongoose = require('mongoose');

const paypalTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paypalOrderId: {
    type: String,
    required: true,
    unique: true
  },
  paypalPaymentId: {
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
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  status: {
    type: String,
    enum: ['created', 'approved', 'completed', 'cancelled', 'failed'],
    default: 'created'
  },
  paypalResponse: {
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
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paypalTransactionSchema.index({ user: 1, createdAt: -1 });
paypalTransactionSchema.index({ paypalOrderId: 1 });
paypalTransactionSchema.index({ status: 1 });

const PayPalTransaction = mongoose.model('PayPalTransaction', paypalTransactionSchema);

module.exports = PayPalTransaction;
