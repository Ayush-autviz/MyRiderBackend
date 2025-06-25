const AdminEarnings = require("../models/AdminEarnings");
const { StatusCodes } = require("http-status-codes");

// Get total admin earnings summary
const getTotalEarnings = async (req, res) => {
  try {
    const totalEarnings = await AdminEarnings.getTotalEarnings();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Total earnings retrieved successfully",
      data: totalEarnings,
    });
  } catch (error) {
    console.error("Error getting total earnings:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get admin earnings by date range
const getEarningsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    if (!startDate || !endDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    if (start > end) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const earnings = await AdminEarnings.find({
      completedAt: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("customer", "name email phone")
      .populate("driver", "name email phone")
      .populate("ride", "status rating")
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await AdminEarnings.countDocuments({
      completedAt: {
        $gte: start,
        $lte: end,
      },
    });

    // Calculate summary for the date range
    const summary = await AdminEarnings.aggregate([
      {
        $match: {
          completedAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$commissionAmount" },
          totalRides: { $sum: 1 },
          totalFareAmount: { $sum: "$totalFare" },
          averageCommission: { $avg: "$commissionAmount" },
          averageFare: { $avg: "$totalFare" },
        },
      },
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Earnings retrieved successfully",
      data: {
        earnings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit),
        },
        summary: summary[0] || {
          totalCommission: 0,
          totalRides: 0,
          totalFareAmount: 0,
          averageCommission: 0,
          averageFare: 0,
        },
        dateRange: {
          startDate: start,
          endDate: end,
        },
      },
    });
  } catch (error) {
    console.error("Error getting earnings by date range:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get daily earnings summary
const getDailyEarningsSummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = parseInt(days);

    if (numDays <= 0 || numDays > 365) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Days must be between 1 and 365",
      });
    }

    const dailySummary = await AdminEarnings.getDailyEarningsSummary(numDays);

    // Format the response
    const formattedSummary = dailySummary.map((day) => ({
      date: `${day._id.year}-${String(day._id.month).padStart(2, "0")}-${String(
        day._id.day
      ).padStart(2, "0")}`,
      earnings: day.dailyEarnings,
      ridesCount: day.ridesCount,
      averageFare: parseFloat(day.averageFare.toFixed(2)),
      averageCommission: parseFloat(day.averageCommission.toFixed(2)),
    }));

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Daily earnings summary retrieved successfully",
      data: {
        summary: formattedSummary,
        period: `Last ${numDays} days`,
      },
    });
  } catch (error) {
    console.error("Error getting daily earnings summary:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get earnings by vehicle type
const getEarningsByVehicleType = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchCondition = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchCondition.completedAt = { $gte: start, $lte: end };
    }

    const vehicleTypeEarnings = await AdminEarnings.aggregate([
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$vehicleType",
          totalCommission: { $sum: "$commissionAmount" },
          totalRides: { $sum: 1 },
          totalFareAmount: { $sum: "$totalFare" },
          averageCommission: { $avg: "$commissionAmount" },
          averageFare: { $avg: "$totalFare" },
          averageDistance: { $avg: "$rideDistance" },
        },
      },
      {
        $sort: { totalCommission: -1 },
      },
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Earnings by vehicle type retrieved successfully",
      data: vehicleTypeEarnings,
    });
  } catch (error) {
    console.error("Error getting earnings by vehicle type:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get monthly earnings summary
const getMonthlyEarningsSummary = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const numMonths = parseInt(months);

    if (numMonths <= 0 || numMonths > 24) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Months must be between 1 and 24",
      });
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numMonths);

    const monthlySummary = await AdminEarnings.aggregate([
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
          },
          monthlyEarnings: { $sum: "$commissionAmount" },
          ridesCount: { $sum: 1 },
          averageFare: { $avg: "$totalFare" },
          averageCommission: { $avg: "$commissionAmount" },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
    ]);

    // Format the response
    const formattedSummary = monthlySummary.map((month) => ({
      month: `${month._id.year}-${String(month._id.month).padStart(2, "0")}`,
      earnings: month.monthlyEarnings,
      ridesCount: month.ridesCount,
      averageFare: parseFloat(month.averageFare.toFixed(2)),
      averageCommission: parseFloat(month.averageCommission.toFixed(2)),
    }));

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Monthly earnings summary retrieved successfully",
      data: {
        summary: formattedSummary,
        period: `Last ${numMonths} months`,
      },
    });
  } catch (error) {
    console.error("Error getting monthly earnings summary:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single earning record details
const getEarningDetails = async (req, res) => {
  try {
    const { earningId } = req.params;

    const earning = await AdminEarnings.findById(earningId)
      .populate("customer", "name email phone profileImage")
      .populate("driver", "name email phone profileImage vehicleDetails")
      .populate("ride", "status rating review distance");

    if (!earning) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Earning record not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Earning details retrieved successfully",
      data: earning,
    });
  } catch (error) {
    console.error("Error getting earning details:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTotalEarnings,
  getEarningsByDateRange,
  getDailyEarningsSummary,
  getEarningsByVehicleType,
  getMonthlyEarningsSummary,
  getEarningDetails,
}; 