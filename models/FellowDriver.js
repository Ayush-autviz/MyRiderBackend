const mongoose = require("mongoose");

const fellowDriverSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number"],
    },
    profilePhoto: {
      type: String,
      required: true,
    },
    drivingLicense: {
      front: {
        type: String,
        required: true,
      },
      back: {
        type: String,
        required: true,
      },
      licenseNumber: {
        type: String,
        required: true,
        trim: true,
      },
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
fellowDriverSchema.index({ driver: 1, approvalStatus: 1 });
fellowDriverSchema.index({ approvalStatus: 1, createdAt: -1 });

// Virtual for full name
fellowDriverSchema.virtual("fullName").get(function () {
  return this.name;
});

// Method to approve fellow driver
fellowDriverSchema.methods.approve = function (adminId) {
  this.approvalStatus = "approved";
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = undefined;
  return this.save();
};

// Method to reject fellow driver
fellowDriverSchema.methods.reject = function (reason, adminId) {
  this.approvalStatus = "rejected";
  this.rejectionReason = reason;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

// Static method to get approved fellow drivers for a driver
fellowDriverSchema.statics.getApprovedByDriver = function (driverId) {
  return this.find({
    driver: driverId,
    approvalStatus: "approved",
    isActive: true,
  });
};

// Static method to get pending fellow drivers for admin
fellowDriverSchema.statics.getPendingApprovals = function (page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ approvalStatus: "pending", isActive: true })
    .populate("driver", "firstName lastName phone email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

const FellowDriver = mongoose.model("FellowDriver", fellowDriverSchema);

module.exports = FellowDriver;
