const mongoose = require("mongoose");

const commissionSettingsSchema = new mongoose.Schema(
  {
    commissionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 20,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: "Global commission rate for all rides",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate commission for a given amount
commissionSettingsSchema.methods.calculateCommission = function (rideAmount) {
  const commission = (rideAmount * this.commissionPercentage) / 100;
  return parseFloat(commission.toFixed(2));
};

// Static method to get the current commission rate
commissionSettingsSchema.statics.getCurrentRate = async function () {
  let setting = await this.findOne({ isActive: true });

  if (!setting) {
    // Create default setting if none exists
    setting = await this.create({
      commissionPercentage: 20,
      description: "Default global commission rate",
      isActive: true,
    });
  }

  return setting;
};

const CommissionSettings = mongoose.model(
  "CommissionSettings",
  commissionSettingsSchema
);

module.exports = CommissionSettings;
