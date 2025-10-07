const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const User = require("../models/User");
const CommissionSettings = require("../models/CommissionSettings");
const AdminEarnings = require("../models/AdminEarnings");
const { StatusCodes } = require("http-status-codes");
const { WalletService } = require("./Wallet");
const fcmService = require("../services/fcmService");

// Generate 4-digit OTP for ride verification
function generateRideOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Driver accepts ride
const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(rideId).populate("vehicle");
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (ride.status !== "searchingDriver") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Ride is no longer available",
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver.liveRequests.some((req) => req.rideId.equals(rideId))) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Ride request not assigned to you",
      });
    }

    // Calculate fare based on distance and vehicle pricePerKm
    if (ride.distance && ride.vehicle.pricePerKm) {
      ride.fare = ride.distance * ride.vehicle.pricePerKm;
    }

    // Check user wallet balance and deduct payment
    const user = await User.findById(ride.customer);
    if (user.walletAmount < ride.fare) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Insufficient wallet balance. Required: $${ride.fare}, Available: $${user.walletAmount}`,
        data: {
          requiredAmount: ride.fare,
          availableBalance: user.walletAmount,
          shortfall: ride.fare - user.walletAmount,
        },
      });
    }

    // Deduct amount from user wallet
    const walletResult = await WalletService.debitUserWallet(
      user._id,
      ride.fare,
      `Payment for ride from ${ride.pickupLocation.address} to ${ride.destination.address}`,
      "ride_payment",
      {
        rideId: ride._id,
        driverId: driverId,
        vehicleType: ride.vehicle.type,
      }
    );

    // Update ride and driver
    ride.driver = driverId;
    ride.status = "accepted";

    // Add fellow driver information to the ride
    if (driver.liveFellowDriver) {
      ride.fellowDriver = driver.liveFellowDriver;
    }

    await ride.save();

    await Driver.findByIdAndUpdate(driverId, {
      isAvailable: false,
      currentRide: rideId,
      $pull: { liveRequests: { rideId } },
    });

    // Notify customer via socket
    if (req.io) {
      const driverDetails = await Driver.findById(driverId).select(
        "firstName lastName vehicleDetails currentLocation"
      );

      req.io.to(`customer_${ride.customer}`).emit("rideAccepted", {
        rideId,
        driverId,
        driver: driverDetails,
      });

      // Subscribe customer to driver's location
      req.io
        .to(`customer_${ride.customer}`)
        .emit("subscribeToDriverLocation", driverId);
    }

    // Send FCM notification to customer
    if (user.fcmToken) {
      await fcmService.sendToToken(user.fcmToken, {
        title: "Ride Accepted",
        body: `Your ride has been accepted by ${driver.firstName || 'Driver'}`,
      }, {
        rideId: rideId,
        type: 'ride_accepted',
        driverId: driverId,
        driverName: driver.firstName || 'Driver',
        fare: ride.fare,
      });
    }

    // Notify other drivers that ride is taken and remove from their liveRequests
    const nearbyDrivers = await Driver.find({
      "liveRequests.rideId": rideId,
    });

    const notificationPromises = nearbyDrivers.map(async (nearbyDriver) => {
      if (req.io) {
        req.io.to(`driver_${nearbyDriver._id}`).emit("rideTaken", { rideId });
      }
      await Driver.findByIdAndUpdate(nearbyDriver._id, {
        $pull: { liveRequests: { rideId } },
      });
    });

    await Promise.all(notificationPromises);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Ride accepted successfully",
      data: { ride },
    });
  } catch (error) {
    console.error("Error accepting ride:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error accepting ride",
      error: error.message,
    });
  }
};

// Driver arrived at pickup location
const driverArrived = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to update this ride",
      });
    }

    // Check if ride is in the correct state
    if (ride.status !== "accepted") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot mark as arrived. Current status is: ${ride.status}`,
      });
    }

    // Generate OTP for ride verification
    const rideOtp = generateRideOTP();

    // Update ride status and OTP
    ride.status = "arrived";
    ride.rideOtp = rideOtp;
    await ride.save();

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit("driverArrived", {
        rideId: ride._id,
        message: "Your driver has arrived at the pickup location",
        rideOtp,
      });
    }

    // Send FCM notification to customer
    const customer = await User.findById(ride.customer);
    if (customer && customer.fcmToken) {
      await fcmService.sendToToken(customer.fcmToken, {
        title: "Driver Arrived",
        body: "Your driver has arrived at the pickup location",
      }, {
        rideId: rideId,
        type: 'driver_arrived',
        rideOtp: rideOtp,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Status updated to arrived",
      data: { ride },
    });
  } catch (error) {
    console.error("Error updating ride status:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify ride OTP and start ride
const verifyRideOtp = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { otp, customerVehiclePlateNumber } = req.body;
    const driverId = req.user.id;

    if (!otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "OTP is required",
      });
    }

    const ride = await Ride.findById(rideId).populate("vehicle");
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Check if vehicle type is carWithExtraDriver and require customer vehicle plate number
    if (ride.vehicle.type === "carWithExtraDriver") {
      if (!customerVehiclePlateNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message:
            "Customer vehicle plate number is required for carWithExtraDriver rides",
        });
      }
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to update this ride",
      });
    }

    // Check if ride is in the correct state
    if (ride.status !== "arrived") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot verify OTP. Current status is: ${ride.status}`,
      });
    }

    // Verify OTP
    if (ride.rideOtp !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Update ride status and clear OTP
    ride.status = "otp_verified";
    ride.rideOtp = null;

    // Save customer vehicle plate number for carWithExtraDriver rides
    if (
      ride.vehicle.type === "carWithExtraDriver" &&
      customerVehiclePlateNumber
    ) {
      ride.customerVehiclePlateNumber =
        customerVehiclePlateNumber.toUpperCase();
    }

    await ride.save();

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit("otpVerified", {
        rideId: ride._id,
        message: "OTP verified successfully. Your ride is starting.",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP verified successfully",
      data: { ride },
    });
  } catch (error) {
    console.error("Error verifying ride OTP:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
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
        message: "Ride not found",
      });
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to update this ride",
      });
    }

    // Check if ride is in the correct state
    if (ride.status !== "otp_verified") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot start ride. Current status is: ${ride.status}`,
      });
    }

    // Update ride status
    ride.status = "in_progress";
    await ride.save();

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit("rideStarted", {
        rideId: ride._id,
        message: "Your ride has started",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Ride started successfully",
      data: { ride },
    });
  } catch (error) {
    console.error("Error starting ride:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
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
        message: "Ride not found",
      });
    }

    // Verify that this driver is assigned to this ride
    if (ride.driver.toString() !== driverId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to update this ride",
      });
    }

    // Check if ride is in the correct state
    if (!["otp_verified", "in_progress"].includes(ride.status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot complete ride. Current status is: ${ride.status}`,
      });
    }

    // Get current commission setting
    const commissionSetting = await CommissionSettings.getCurrentRate();

    // Calculate commission and driver earning
    const commissionAmount = commissionSetting.calculateCommission(ride.fare);
    const driverEarning = ride.fare - commissionAmount;

    // Transfer payment to driver wallet
    const driverWalletResult = await WalletService.creditDriverWallet(
      driverId,
      driverEarning,
      `Ride earning from ${ride.pickupLocation.address} to ${ride.destination.address}`,
      "ride_earning",
      {
        rideId: ride._id,
        customerId: ride.customer,
        totalFare: ride.fare,
        commissionAmount: commissionAmount,
        commissionPercentage: commissionSetting.commissionPercentage,
        vehicleType: ride.vehicle.type,
      }
    );

    // Update ride status
    ride.status = "completed";
    ride.completedAt = new Date();
    await ride.save();

    // Populate ride with vehicle details for admin earnings
    await ride.populate("vehicle");

    // Record admin earnings
    const adminEarning = new AdminEarnings({
      ride: ride._id,
      customer: ride.customer,
      driver: driverId,
      totalFare: ride.fare,
      commissionAmount: commissionAmount,
      commissionPercentage: commissionSetting.commissionPercentage,
      driverEarning: driverEarning,
      vehicleType: ride.vehicle.type,
      pickupLocation: {
        address: ride.pickupLocation.address,
        coordinates: ride.pickupLocation.coordinates,
      },
      destination: {
        address: ride.destination.address,
        coordinates: ride.destination.coordinates,
      },
      rideDistance: ride.distance,
      completedAt: ride.completedAt,
    });

    await adminEarning.save();

    // Update driver status
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        isAvailable: true,
        currentRide: null,
        $inc: { totalRides: 1 },
      },
      { new: true }
    );

    // Clear user's currentRide field
    await User.findByIdAndUpdate(ride.customer, {
      currentRide: null,
    });

    // Notify customer via socket
    if (req.io) {
      req.io.to(`customer_${ride.customer}`).emit("rideCompleted", {
        rideId: ride._id,
        message: "Your ride has been completed",
        fare: ride.fare,
      });

      // Notify driver about earnings
      req.io.to(`driver_${driverId}`).emit("rideCompleted", {
        rideId: ride._id,
        totalFare: ride.fare,
        earning: driverEarning,
        commission: commissionAmount,
        newWalletBalance: driverWalletResult.newBalance,
        message: "Ride completed successfully",
      });
    }

    // Send FCM notifications
    const customer = await User.findById(ride.customer);
    const driver = await Driver.findById(driverId);

    // Notify customer
    if (customer && customer.fcmToken) {
      await fcmService.sendToToken(customer.fcmToken, {
        title: "Ride Completed",
        body: "Your ride has been completed successfully",
      }, {
        rideId: rideId,
        type: 'ride_completed',
        fare: ride.fare,
        driverEarning: driverEarning,
      });
    }

    // Notify driver
    if (driver && driver.fcmToken) {
      await fcmService.sendToToken(driver.fcmToken, {
        title: "Ride Completed",
        body: `You earned $${driverEarning} from this ride`,
      }, {
        rideId: rideId,
        type: 'ride_completed',
        totalFare: ride.fare,
        earning: driverEarning,
        commission: commissionAmount,
        newWalletBalance: driverWalletResult.newBalance,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Ride completed successfully",
      data: {
        ride,
        payment: {
          totalFare: ride.fare,
          driverEarning: driverEarning,
          commissionAmount: commissionAmount,
          commissionPercentage: commissionSetting.commissionPercentage,
        },
        driverNewBalance: driverWalletResult.newBalance,
      },
    });
  } catch (error) {
    console.error("Error completing ride:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel ride
const cancelRide = async (req, res) => {
  console.log("canacelling ride");
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Verify that this user is authorized to cancel the ride
    if (userRole === "customer" && ride.customer.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to cancel this ride",
      });
    }

    if (
      userRole === "driver" &&
      ride.driver &&
      ride.driver.toString() !== userId
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to cancel this ride",
      });
    }

    // Check if ride can be cancelled
    if (["completed", "cancelled"].includes(ride.status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot cancel ride. Current status is: ${ride.status}`,
      });
    }

    // If payment was already deducted (ride was accepted), refund to customer
    let refundAmount = 0;
    if (
      ride.status === "accepted" ||
      ride.status === "arrived" ||
      ride.status === "otp_verified" ||
      ride.status === "in_progress"
    ) {
      refundAmount = ride.fare;
      await WalletService.creditUserWallet(
        ride.customer,
        ride.fare,
        `Refund for cancelled ride from ${ride.pickupLocation.address}`,
        "refund",
        {
          rideId: ride._id,
          cancelledBy: userRole,
          reason: reason,
        }
      );
    }

    // Update ride status
    ride.status = "cancelled";
    ride.cancelledAt = new Date();
    ride.cancelledBy = userRole;
    if (reason) {
      ride.cancellationReason = reason;
    }
    await ride.save();

    // Clear user's currentRide field
    await User.findByIdAndUpdate(ride.customer, {
      currentRide: null,
    });

    // If driver exists, update driver status
    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, {
        isAvailable: true,
        currentRide: null,
      });

      // Notify driver via socket
      if (req.io && userRole === "customer") {
        req.io.to(`driver_${ride.driver}`).emit("rideCancelled", {
          rideId: ride._id,
          message: "The ride has been cancelled by the customer",
          reason,
        });
      }
    }

    // Notify customer via socket
    if (req.io && userRole === "driver") {
      req.io.to(`customer_${ride.customer}`).emit("rideCancelled", {
        rideId: ride._id,
        message: "The ride has been cancelled by the driver",
        reason,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Ride cancelled successfully",
      data: {
        ride,
        refundAmount: refundAmount,
      },
    });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  acceptRide,
  driverArrived,
  verifyRideOtp,
  startRide,
  completeRide,
  cancelRide,
};
