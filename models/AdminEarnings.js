const mongoose = require("mongoose");

const adminEarningsSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    commissionPercentage: {
      type: Number,
      required: true,
    },
    driverEarning: {
      type: Number,
      required: true,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    pickupLocation: {
      address: String,
      coordinates: [Number],
    },
    destination: {
      address: String,
      coordinates: [Number],
    },
    rideDistance: {
      type: Number,
    },
    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
adminEarningsSchema.index({ completedAt: -1 });
adminEarningsSchema.index({ ride: 1 });

// Static method to get total earnings
adminEarningsSchema.statics.getTotalEarnings = async function () {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCommission: { $sum: "$commissionAmount" },
        totalRides: { $sum: 1 },
        averageCommission: { $avg: "$commissionAmount" },
      },
    },
  ]);

  return result[0] || {
    totalCommission: 0,
    totalRides: 0,
    averageCommission: 0,
  };
};

// Static method to get earnings by date range
adminEarningsSchema.statics.getEarningsByDateRange = async function (
  startDate,
  endDate
) {
  return await this.find({
    completedAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("customer", "name email phone")
    .populate("driver", "name email phone")
    .populate("ride", "status rating")
    .sort({ completedAt: -1 });
};

// Static method to get daily earnings summary
adminEarningsSchema.statics.getDailyEarningsSummary = async function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        completedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$completedAt" },
          month: { $month: "$completedAt" },
          day: { $dayOfMonth: "$completedAt" },
        },
        dailyEarnings: { $sum: "$commissionAmount" },
        ridesCount: { $sum: 1 },
        averageFare: { $avg: "$totalFare" },
        averageCommission: { $avg: "$commissionAmount" },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 },
    },
  ]);
};

const AdminEarnings = mongoose.model("AdminEarnings", adminEarningsSchema);

module.exports = AdminEarnings; 