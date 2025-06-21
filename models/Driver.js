const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const driverSchema = new mongoose.Schema(
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
    licenseNumber: {
      type: String,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ["car", "bike"],
    },
    vehicleDetails: {
      brand: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
      year: {
        type: Number,
      },
      color: {
        type: String,
        trim: true,
      },
      licensePlate: {
        type: String,
        trim: true,
        uppercase: true,
      },
      vehicleImage: {
        image: {
          type: String,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      numberPlateImage: {
        image: {
          type: String,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    },
    documents: {
      drivingLicense: {
        front: {
          type: String,
        },
        back: {
          type: String,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      vehicleRegistration: {
        image: {
          type: String,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      profilePhoto: {
        image: {
          type: String,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    registrationComplete: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: [true, "Rating is required"],
        },
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    withExtraDriver: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: [
        "VehiclePending",
        "DocumentsPending",
        "ApprovalPending",
        "active",
        "suspended",
        "rejected",
      ],
      default: "VehiclePending",
    },
    currentRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      default: null,
    },
    liveRequests: [
      {
        rideId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ride",
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],
    fcmToken: {
      type: String,
      trim: true,
    },
    walletAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
driverSchema.index({ currentLocation: "2dsphere" });

// Pre-save hook to update average rating
driverSchema.pre("save", function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce(
      (sum, item) => sum + item.rating,
      0
    );
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

// Method to clean up expired requests
driverSchema.methods.cleanupExpiredRequests = async function () {
  const now = new Date();
  this.liveRequests = this.liveRequests.filter(
    (request) => request.expiresAt > now
  );
  await this.save();
};

driverSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      phone: this.phone,
      role: "driver",
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

driverSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { id: this._id, phone: this.phone, role: "driver" },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
