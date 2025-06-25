const express = require("express");
const router = express.Router();
const { authAdmin } = require("../middlewares/AdminAuthentication");

const {
  getTotalEarnings,
  getEarningsByDateRange,
  getDailyEarningsSummary,
  getEarningsByVehicleType,
  getMonthlyEarningsSummary,
  getEarningDetails,
} = require("../controllers/AdminEarnings");

// Apply admin authentication to all routes
router.use(authAdmin);

// Get total admin earnings summary
router.get("/total", getTotalEarnings);

// Get admin earnings by date range
router.get("/date-range", getEarningsByDateRange);

// Get daily earnings summary
router.get("/daily-summary", getDailyEarningsSummary);

// Get monthly earnings summary
router.get("/monthly-summary", getMonthlyEarningsSummary);

// Get earnings breakdown by vehicle type
router.get("/by-vehicle-type", getEarningsByVehicleType);

// Get detailed information about a specific earning record
router.get("/:earningId", getEarningDetails);

module.exports = router; 