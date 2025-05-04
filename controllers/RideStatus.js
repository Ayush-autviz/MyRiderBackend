const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// Generate 4-digit OTP for ride verification
function generateRideOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Driver arrived at pickup location
const driverArrived = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to update this ride'
      });
    }

    // Check if ride is in the correct state
    if (ride.status !== 'accepted') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot mark as arrived. Current status is: ${ride.status}`
      });
    }

    // Generate OTP for ride verification
    const rideOtp = generateRideOTP();

    // Update ride status and OTP
    ride.status = 'arrived';
    ride.rideOtp = rideOtp;
    await ride.save();

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit('driverArrived', {
        rideId: ride._id,
        message: 'Your driver has arrived at the pickup location',
        rideOtp
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Status updated to arrived',
      data: { ride }
    });
  } catch (error) {
    console.error('Error updating ride status:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};



// Verify ride OTP and start ride
const verifyRideOtp = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { otp } = req.body;
    const driverId = req.user.id;

    if (!otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to update this ride'
      });
    }

    // Check if ride is in the correct state
    if (ride.status !== 'arrived') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot verify OTP. Current status is: ${ride.status}`
      });
    }

    // Verify OTP
    if (ride.rideOtp !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Update ride status and clear OTP
    ride.status = 'otp_verified';
    ride.rideOtp = null;
    await ride.save();

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit('otpVerified', {
        rideId: ride._id,
        message: 'OTP verified successfully. Your ride is starting.'
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'OTP verified successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Error verifying ride OTP:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Start ride (moving to destination)
const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to update this ride'
      });
    }

    // Check if ride is in the correct state
    if (ride.status !== 'otp_verified') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot start ride. Current status is: ${ride.status}`
      });
    }

    // Update ride status
    ride.status = 'in_progress';
    await ride.save();

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit('rideStarted', {
        rideId: ride._id,
        message: 'Your ride has started'
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride started successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Error starting ride:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Complete ride
const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to update this ride'
      });
    }

    // Check if ride is in the correct state
    if (ride.status !== 'in_progress') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot complete ride. Current status is: ${ride.status}`
      });
    }

    // Update ride status
    ride.status = 'completed';
    await ride.save();

    // Update driver status
    await Driver.findByIdAndUpdate(driverId, {
      isAvailable: true,
      currentRide: null
    });

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit('rideCompleted', {
        rideId: ride._id,
        message: 'Your ride has been completed',
        fare: ride.fare
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride completed successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Error completing ride:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel ride
const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Verify that this user is authorized to cancel the ride
    if (userRole === 'customer' && ride.customer.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to cancel this ride'
      });
    }

    if (userRole === 'driver' && ride.driver && ride.driver.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to cancel this ride'
      });
    }

    // Check if ride can be cancelled
    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot cancel ride. Current status is: ${ride.status}`
      });
    }

    // Update ride status
    ride.status = 'cancelled';
    if (reason) {
      ride.cancellationReason = reason;
    }
    await ride.save();

    // If driver exists, update driver status
    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, {
        isAvailable: true,
        currentRide: null
      });

      // Notify driver via socket
      if (req.io && userRole === 'customer') {
        req.io.to(`driver_${ride.driver}`).emit('rideCancelled', {
          rideId: ride._id,
          message: 'The ride has been cancelled by the customer',
          reason
        });
      }
    }

    // Notify customer via socket
    if (req.io && userRole === 'driver') {
      req.io.to(`customer_${ride.customer}`).emit('rideCancelled', {
        rideId: ride._id,
        message: 'The ride has been cancelled by the driver',
        reason
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride cancelled successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Error cancelling ride:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  driverArrived,
  verifyRideOtp,
  startRide,
  completeRide,
  cancelRide
};
