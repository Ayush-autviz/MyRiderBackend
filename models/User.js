const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    otp: {
      type: String,
      maxlength: 4,
    },
    otpExpires: {
      type: Date,
    },
    walletAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    profileStatus: {
      type: Number,
      default: 1,
      enum: [0, 1, 2], // 0: inactive, 1: active, 2: suspended
    },
    registrationComplete: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    currentRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// userSchema.index({ phone: 1 });
// userSchema.index({ email: 1 });

// JWT methods
userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      phone: this.phone,
      role: "customer",
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { id: this._id, phone: this.phone, role: "customer" },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

// Clear OTP if expired
userSchema.pre("findOne", async function (next) {
  const query = this.getQuery();
  if (query.otp) {
    const user = await this.model.findOne(query);
    if (user && user.otpExpires < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      await user.save();
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
