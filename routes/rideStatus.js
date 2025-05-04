const express = require('express');
const router = express.Router();

const {
  driverArrived,
  verifyRideOtp,
  startRide,
  completeRide,
  cancelRide
} = require('../controllers/RideStatus');

const authDriver = require('../middlewares/DriverAuthentication');
const authUser = require('../middlewares/UserAuthentication');

// Driver status updates
router.put('/driver/arrived/:rideId', authDriver, driverArrived);
router.put('/driver/verify-otp/:rideId', authDriver, verifyRideOtp);
router.put('/driver/start/:rideId', authDriver, startRide);
router.put('/driver/complete/:rideId', authDriver, completeRide);

// Cancel ride (can be done by both driver and customer)
router.put('/driver/cancel/:rideId', authDriver, cancelRide);
router.put('/customer/cancel/:rideId', authUser, cancelRide);

module.exports = router;
