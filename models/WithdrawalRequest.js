const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  requestedAmount: {
    type: Number,
    required: true,
    min: 1
  },
  bankDetails: {
    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    routingNumber: {
      type: String,
      trim: true
    },
    swiftCode: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed', 'failed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'check'],
    default: 'bank_transfer'
  },
  walletTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
withdrawalRequestSchema.index({ driver: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });
withdrawalRequestSchema.index({ processedBy: 1 });

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

module.exports = WithdrawalRequest;
