const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null,
  },
  pickupLocation: {
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  destination: {
    address: {
      type: String,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'pending',                // Initial state when ride is created
      'searchingDriver',        // Searching for available drivers
      'accepted',               // Driver has accepted the ride
      'arrived',                // Driver has arrived at pickup location and is waiting for customer
      'otp_verified',           // OTP verified, customer has entered the cab
      'in_progress',            // Ride is in progress (moving to destination)
      'completed',              // Ride has been completed
      'cancelled',              // Ride was cancelled
      'noDriversFound'          // No drivers were found for the ride
    ],
    default: 'pending',
  },
  rideOtp: {
    type: String,
    maxlength: 4,
  },
  fare: {
    type: Number,
  },
  distance: {
    type: Number,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  review: {
    type: String,
    default: null,
  },
  isRated: {
    type: Boolean,
    default: false,
  },
  customerVehiclePlateNumber: {
    type: String,
    trim: true,
    uppercase: true,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create geospatial index for pickup location
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

// Update updatedAt timestamp on save
rideSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;