const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['tractor', 'harvester', 'sprayer', 'thresher', 'other']
  },
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  model: String,
  pricing: {
    scheme: {
      type: String,
      required: true,
      // 👇 FIXED: Added 'time' to prevent validation error
      enum: ['hourly', 'time', 'area', 'daily']
    },
    rate: {
      type: Number,
      required: true,
      min: [0, 'Rate cannot be negative']
    },
    unit: {
      type: String,
      required: true,
      enum: ['hour', 'bigha', 'day']
    }
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    addressText: String
  },
  availability: {
    type: Boolean,
    default: true
  },
  maintenance: {
    lastServiceAt: Date,
    nextServiceDueAt: Date,
    notes: String
  },
  images: [String],
  meta: {
    year: Number,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'other'],
      default: 'diesel'
    },
    averageRating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    }
  },
  usageHistory: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    startAt: Date,
    endAt: Date,
    durationMinutes: Number
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
machineSchema.index({ ownerId: 1 });
machineSchema.index({ type: 1 });
machineSchema.index({ availability: 1 });
machineSchema.index({ location: '2dsphere' });
machineSchema.index({ 'maintenance.nextServiceDueAt': 1 });
machineSchema.index({ 'meta.averageRating': -1 });

// Virtual for displaying rating stars
machineSchema.virtual('ratingStars').get(function() {
  const rating = this.meta.averageRating;
  if (rating === 0) return 'No ratings yet';
  
  const fullStars = '⭐'.repeat(Math.floor(rating));
  const halfStar = rating % 1 >= 0.5 ? '⭐' : '';
  return fullStars + halfStar;
});

module.exports = mongoose.model('Machine', machineSchema);