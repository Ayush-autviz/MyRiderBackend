const express = require('express');
const router = express.Router();

const { rateRide, getDriverRatings } = require('../controllers/Rating');
const authUser = require('../middlewares/UserAuthentication');

// Rate a ride
router.post('/ride/:rideId', authUser, rateRide);

// Get driver ratings
router.get('/driver/:driverId', getDriverRatings);

module.exports = router;
