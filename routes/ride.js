const express = require("express");
const router = express.Router();

const {
  createRide,
  getRideById,
  getUserRides,
} = require("../controllers/Ride");
const authUser = require("../middlewares/UserAuthentication");
const authDriver = require("../middlewares/DriverAuthentication");

// Create a new ride
router.post("/create", authUser, createRide);

// Get ride by ID
router.get("/:rideId", authUser, getRideById);

router.get("/driver/:rideId", authDriver, getRideById);

// Get user's ride history
router.get("/", authUser, getUserRides);

module.exports = router;
