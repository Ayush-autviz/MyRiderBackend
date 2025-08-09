const express = require("express");
const router = express.Router();

const {
  adminLogin,
  refreshToken,
  getDashboardStats,
  getRecentActivity,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserProfile,
  getUserRides,
  getAllDrivers,
  getDriverDetails,
  updateDriverApproval,
  updateDriverStatus,
  getDriverRides,
  getAllRides,
  getRideDetails,
  cancelRide,
  getAnalytics,
} = require("../controllers/Admin");

const {
  getCommissionSettings,
  updateCommissionSetting,
  initializeDefaultCommission,
} = require("../controllers/Commission");

const {
  getAllWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
} = require("../controllers/Withdrawal");

const {
  getAllFellowDrivers,
  getPendingFellowDrivers,
  getFellowDriverDetails,
  approveFellowDriver,
  rejectFellowDriver,
  updateFellowDriverApproval,
} = require("../controllers/AdminFellowDriver");

const {
  authAdmin,
  requirePermission,
  requireAnyPermission,
} = require("../middlewares/AdminAuthentication");

// ==================== AUTHENTICATION ROUTES ====================
router.post("/login", adminLogin);
router.post("/refresh-token", refreshToken);

// ==================== DASHBOARD ROUTES ====================
router.get(
  "/dashboard/stats",
  authAdmin,
  requireAnyPermission(["analytics_read"]),
  getDashboardStats
);
router.get(
  "/dashboard/recent-activity",
  authAdmin,
  requireAnyPermission(["analytics_read"]),
  getRecentActivity
);
router.get(
  "/analytics",
  authAdmin,
  requirePermission("analytics_read"),
  getAnalytics
);

// ==================== USER MANAGEMENT ROUTES ====================
router.get("/users", authAdmin, requirePermission("users_read"), getAllUsers);
router.get(
  "/users/:userId",
  authAdmin,
  requirePermission("users_read"),
  getUserDetails
);
router.put(
  "/users/:userId/status",
  authAdmin,
  requirePermission("users_write"),
  updateUserStatus
);
router.put(
  "/users/:userId/profile",
  authAdmin,
  requirePermission("users_write"),
  updateUserProfile
);
router.get(
  "/users/:userId/rides",
  authAdmin,
  requirePermission("users_read"),
  getUserRides
);

// ==================== DRIVER MANAGEMENT ROUTES ====================
router.get(
  "/drivers",
  authAdmin,
  requirePermission("drivers_read"),
  getAllDrivers
);
router.get(
  "/drivers/:driverId",
  authAdmin,
  requirePermission("drivers_read"),
  getDriverDetails
);
router.put(
  "/drivers/:driverId/approval",
  authAdmin,
  requirePermission("drivers_approve"),
  updateDriverApproval
);
router.put(
  "/drivers/:driverId/status",
  authAdmin,
  requirePermission("drivers_write"),
  updateDriverStatus
);
router.get(
  "/drivers/:driverId/rides",
  authAdmin,
  requirePermission("drivers_read"),
  getDriverRides
);

// ==================== RIDE MANAGEMENT ROUTES ====================
router.get("/rides", authAdmin, requirePermission("rides_read"), getAllRides);
router.get(
  "/rides/:rideId",
  authAdmin,
  requirePermission("rides_read"),
  getRideDetails
);
router.put(
  "/rides/:rideId/cancel",
  authAdmin,
  requirePermission("rides_cancel"),
  cancelRide
);

// ==================== COMMISSION MANAGEMENT ROUTES ====================
router.get(
  "/commission",
  authAdmin,
  requirePermission("system_settings"),
  getCommissionSettings
);
router.put(
  "/commission",
  authAdmin,
  requirePermission("system_settings"),
  updateCommissionSetting
);
router.post(
  "/commission/initialize",
  authAdmin,
  requirePermission("system_settings"),
  initializeDefaultCommission
);

// ==================== WITHDRAWAL MANAGEMENT ROUTES ====================
router.get(
  "/withdrawals",
  authAdmin,
  requireAnyPermission(["drivers_read", "system_settings"]),
  getAllWithdrawalRequests
);
router.put(
  "/withdrawals/:requestId/approve",
  authAdmin,
  requirePermission("system_settings"),
  approveWithdrawalRequest
);
router.put(
  "/withdrawals/:requestId/reject",
  authAdmin,
  requirePermission("system_settings"),
  rejectWithdrawalRequest
);

// ==================== FELLOW DRIVER MANAGEMENT ROUTES ====================
router.get(
  "/fellow-drivers",
  authAdmin,
  requirePermission("drivers_read"),
  getAllFellowDrivers
);
router.get(
  "/fellow-drivers/pending",
  authAdmin,
  requirePermission("drivers_read"),
  getPendingFellowDrivers
);
router.get(
  "/fellow-drivers/:fellowDriverId",
  authAdmin,
  requirePermission("drivers_read"),
  getFellowDriverDetails
);
router.put(
  "/fellow-drivers/:fellowDriverId/approve",
  authAdmin,
  requirePermission("drivers_approve"),
  approveFellowDriver
);
router.put(
  "/fellow-drivers/:fellowDriverId/reject",
  authAdmin,
  requirePermission("drivers_approve"),
  rejectFellowDriver
);
router.put(
  "/fellow-drivers/:fellowDriverId/approval",
  authAdmin,
  requirePermission("drivers_approve"),
  updateFellowDriverApproval
);

module.exports = router;
