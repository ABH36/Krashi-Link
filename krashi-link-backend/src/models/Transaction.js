const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    // 👇 FIXED: Added 'payment' to allowed types
    enum: ['debit', 'credit', 'refund', 'hold', 'release', 'payment']
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    required: true,
    // 👇 FIXED: Added 'completed' to allowed statuses
    enum: ['pending', 'verified', 'failed', 'released', 'refunded', 'completed'],
    default: 'pending'
  },
  gateway: {
    type: String,
    default: 'none'
  },
  gatewayOrderId: String,   // Added for Razorpay/Mock Order ID
  gatewayPaymentId: String, // Added for Razorpay/Mock Payment ID
  audit: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ farmerId: 1, status: 1 });
transactionSchema.index({ ownerId: 1, status: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);