const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { StatusCodes } = require('http-status-codes');

/**
 * Rate a completed ride and the driver
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with success/error message
 */
const rateRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Rating is required and must be between 1 and 5'
      });
    }

    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if the ride belongs to the user
    if (ride.customer.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to rate this ride'
      });
    }

    // Check if the ride is completed
    if (ride.status !== 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only completed rides can be rated'
      });
    }

    // Check if the ride has already been rated
    if (ride.isRated) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'This ride has already been rated'
      });
    }

    // Update the ride with rating and review
    ride.rating = rating;
    ride.review = review || '';
    ride.isRated = true;
    await ride.save();

    // Update the driver's ratings
    if (ride.driver) {
      const driver = await Driver.findById(ride.driver);
      if (driver) {
        // Add the rating to the driver's ratings array
        driver.ratings.push({
          user: userId,
          rating,
          comment: review || '',
          date: new Date()
        });

        // Increment total rides count
        driver.totalRides += 1;

        // Save the driver (average rating is calculated in pre-save hook)
        await driver.save();
      }
    }

    // Notify the driver via socket if available
    if (req.io && ride.driver) {
      req.io.to(`driver_${ride.driver}`).emit('rideRated', {
        rideId: ride._id,
        rating,
        review: review || ''
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride and driver rated successfully',
      data: {
        ride: {
          id: ride._id,
          rating: ride.rating,
          review: ride.review
        }
      }
    });
  } catch (error) {
    console.error('Error rating ride:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get driver ratings
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} Response with driver ratings
 */
const getDriverRatings = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId)
      .select('ratings averageRating totalRides')
      .populate('ratings.user', 'firstName lastName');

    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Driver not found'
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        averageRating: driver.averageRating,
        totalRatings: driver.ratings.length,
        totalRides: driver.totalRides,
        ratings: driver.ratings
      }
    });
  } catch (error) {
    console.error('Error fetching driver ratings:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  rateRide,
  getDriverRatings
};
