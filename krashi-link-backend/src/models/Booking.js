const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: [
      'requested',
      'owner_confirmed',
      'arrived_otp_verified',
      'in_progress',
      'completed_pending_payment',
      'paid',
      'cancelled',
      'auto_cancelled',
      'disputed'
    ],
    default: 'requested'
  },
  schedule: {
    requestedStartAt: {
      type: Date,
      required: true
    },
    arrivalDeadlineAt: Date,
    estimatedDuration: Number // Added for better estimation display
  },
  otp: {
    arrivalOTP: String,
    completionOTP: String,
    arrivalVerifiedAt: Date,
    completionVerifiedAt: Date,
    expiresAt: Date
  },
  timer: {
    startedAt: Date,
    stoppedAt: Date,
    durationMinutes: Number
  },
  billing: {
    scheme: {
      type: String,
      required: true,
      enum: ['time', 'hourly', 'area', 'daily'] // Ensuring 'hourly' and 'time' both work
    },
    rate: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['hour', 'bigha', 'day']
    },
    areaBigha: Number,
    calculatedAmount: Number,
    paidAmount: Number, // To track actual paid amount
    durationMinutes: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  cancellation: {
    reason: String,
    by: {
      type: String,
      enum: ['farmer', 'owner', 'system', 'admin']
    },
    at: Date
  },
  payment: {
    transactionId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      // 👇 FIXED: Added 'paid' to allowed values
      enum: ['pending', 'paid', 'verified', 'released', 'refunded', 'failed'],
      default: 'pending'
    },
    paidAt: Date
  },
  dispute: {
    code: {
      type: String,
      enum: ['LATE_ARRIVAL', 'OTP_MISMATCH', 'BILLING_ISSUE', 'OTHER']
    },
    description: String,
    resolution: String,
    resolvedAt: Date
  },
  socketRoom: String
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ status: 1 });
bookingSchema.index({ farmerId: 1 });
bookingSchema.index({ ownerId: 1 });
bookingSchema.index({ machineId: 1 });
bookingSchema.index({ createdAt: 1 });
bookingSchema.index({ 'schedule.requestedStartAt': 1 });
bookingSchema.index({ 'schedule.arrivalDeadlineAt': 1 });

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  return ['owner_confirmed', 'arrived_otp_verified', 'in_progress'].includes(this.status);
});

module.exports = mongoose.model('Booking', bookingSchema);