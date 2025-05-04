const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bike', 'car', 'carWithExtraDriver', 'bikeWithExtraDriver'],
    required: true,
    unique: true,
  },
  pricePerKm: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
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

// Update updatedAt timestamp on save
vehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;