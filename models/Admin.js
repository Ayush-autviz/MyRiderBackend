const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin',
  },
  permissions: [{
    type: String,
    enum: [
      'users_read', 'users_write', 'users_delete',
      'drivers_read', 'drivers_write', 'drivers_delete', 'drivers_approve',
      'rides_read', 'rides_write', 'rides_cancel',
      'analytics_read', 'system_settings'
    ],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  profileImage: {
    type: String,
    default: null,
  },
}, { 
  timestamps: true 
});

// Index for faster queries
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to create access token
adminSchema.methods.createAccessToken = function() {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      permissions: this.permissions,
      type: 'admin',
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" },
  );
};

// Method to create refresh token
adminSchema.methods.createRefreshToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      username: this.username,
      type: 'admin'
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    },
  );
};

// Method to check if admin has permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Update lastLogin on successful authentication
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
