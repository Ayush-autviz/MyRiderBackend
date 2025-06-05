const Ride = require("../models/Ride");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const geolib = require("geolib");
const { StatusCodes } = require("http-status-codes");

// Create a new ride
const createRide = async (req, res) => {
  try {
    const { pickupLocation, destination, vehicleId } = req.body;

    // Validate required fields
    if (!pickupLocation || !destination || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Pickup location, destination, and vehicle type are required",
      });
    }

    console.log(pickupLocation, destination, vehicleId);

    // Validate vehicle
    const vehicle = await Vehicle.findById(vehicleId);

    console.log(vehicle, "vehicle");
    if (!vehicle) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid vehicle type",
      });
    }

    // Calculate distance in kilometers
    const distanceMeters = geolib.getDistance(
      {
        latitude: pickupLocation.coordinates[1],
        longitude: pickupLocation.coordinates[0],
      },
      {
        latitude: destination.coordinates[1],
        longitude: destination.coordinates[0],
      }
    );
    const distanceKm = distanceMeters / 1000;

    // Calculate fare based on distance and vehicle price per km
    const fare = parseFloat((vehicle.pricePerKm * distanceKm).toFixed(2));

    // Create ride
    const ride = new Ride({
      customer: req.user.id, // Assuming user ID is available from auth middleware
      pickupLocation,
      destination,
      vehicle: vehicle._id, // Store the vehicle ID
      distance: distanceKm,
      fare: fare,
      status: "searchingDriver", // Use searchingDriver status instead of pending
    });

    console.log(ride, "ride");

    await ride.save();

    // Update user's currentRide field
    await User.findByIdAndUpdate(req.user.id, {
      currentRide: ride._id,
    });

    // Create a response object with the vehicle details
    const rideResponse = {
      id: ride._id,
      pickupLocation: ride.pickupLocation,
      destination: ride.destination,
      vehicle: {
        id: vehicle._id,
        type: vehicle.type,
        description: vehicle.description,
        pricePerKm: vehicle.pricePerKm,
      },
      distance: distanceKm,
      fare: fare,
      status: ride.status,
      createdAt: ride.createdAt,
    };

    // Emit socket event to find drivers (previously in bookRide socket event)
    if (req.io) {
      const socket = req.io;
      const user = req.user;

      // Determine if extra driver is needed
      const needsExtraDriver = vehicle.type.includes("WithExtraDriver");

      // Find nearby drivers matching vehicle type and extra driver requirement
      const nearbyDrivers = await Driver.find({
        isAvailable: true,
        vehicleType: vehicle.type.includes("car") ? "car" : "bike",
        withExtraDriver: needsExtraDriver,
        currentRide: null, // Exclude drivers with active rides
        currentLocation: {
          $geoWithin: {
            $centerSphere: [
              [
                ride.pickupLocation.coordinates[1],
                ride.pickupLocation.coordinates[0],
              ],
              5 / 6378.1, // 5km radius
            ],
          },
        },
      });

      console.log(nearbyDrivers, "nearby");

      // Emit searchingDriver event to customer
      socket.to(`customer_${user.id}`).emit("searchingDriver", {
        rideId: ride._id,
        message: "Searching for available drivers nearby",
        rideDetails: {
          customerId: user.id,
          pickupLocation: ride.pickupLocation,
          destination: ride.destination,
          vehicle: vehicle,
          status: ride.status,
          createdAt: ride.createdAt,
          fare: ride.fare,
        },
      });

      if (nearbyDrivers.length === 0) {
        ride.status = "noDriversFound";
        await ride.save();

        // Clear user's currentRide field since no drivers were found
        await User.findByIdAndUpdate(user.id, {
          currentRide: null,
        });

        socket.to(`customer_${user.id}`).emit("noDriversAvailable", {
          message: "No drivers available nearby",
        });
        console.log(
          `Ride ${ride._id} marked as noDriversFound: no drivers available`
        );
      } else {
        // Send ride request to nearby drivers and add to liveRequests
        const requestExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        const notificationPromises = nearbyDrivers.map(async (driver) => {
          // Add to liveRequests
          await Driver.findByIdAndUpdate(driver._id, {
            $push: {
              liveRequests: {
                rideId: ride._id,
                expiresAt: requestExpiration,
              },
            },
          });

          // Send socket event
          socket.to(`driver_${driver._id}`).emit("rideRequest", {
            rideId: ride._id,
            customerId: user.id,
            pickupLocation: ride.pickupLocation,
            destination: ride.destination,
            vehicle: vehicle,
            fare: ride.fare,
          });
        });

        await Promise.all(notificationPromises);

        // Schedule cleanup of liveRequests after 5 minutes
        setTimeout(async () => {
          try {
            const stillPending = await Ride.findById(ride._id);
            if (stillPending && stillPending.status === "searchingDriver") {
              stillPending.status = "noDriversFound";
              await stillPending.save();

              // Clear user's currentRide field since no drivers accepted
              await User.findByIdAndUpdate(user.id, {
                currentRide: null,
              });

              socket.to(`customer_${user.id}`).emit("noDriversFound", {
                rideId: ride._id,
                message: "No drivers accepted the ride within 5 minutes",
              });

              // Remove ride from liveRequests of all drivers
              const driversWithRequest = await Driver.find({
                "liveRequests.rideId": ride._id,
              });
              await Promise.all(
                driversWithRequest.map(async (driver) => {
                  await Driver.findByIdAndUpdate(driver._id, {
                    $pull: { liveRequests: { rideId: ride._id } },
                  });
                  socket
                    .to(`driver_${driver._id}`)
                    .emit("rideTaken", { rideId: ride._id });
                })
              );
              console.log(
                `Ride ${ride._id} marked as noDriversFound after 5 minutes`
              );
            }
          } catch (error) {
            console.error("Error cleaning up liveRequests:", error);
          }
        }, 5 * 60 * 1000); // 5 minutes

        console.log(
          `Ride ${ride._id} created for customer ${user.id}, sent to ${nearbyDrivers.length} drivers`
        );
      }
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Ride created successfully",
      data: {
        ride: rideResponse,
      },
    });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while creating ride",
      error: error.message,
    });
  }
};

// Get ride by ID
const getRideById = async (req, res) => {
  try {
    const { rideId } = req.params;

    console.log(rideId, "ride details id");

    const ride = await Ride.findById(rideId)
      .populate("driver", "firstName lastName phone vehicleDetails")
      .populate("vehicle");

    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Check if the ride belongs to the authenticated user
    // if (ride.customer.toString() !== req.user.id || ) {
    // return res.status(StatusCodes.FORBIDDEN).json({
    //   success: false,
    //   message: "Unauthorized: Ride does not belong to this user",
    // });

    // Create a response object with the vehicle details
    const rideResponse = {
      id: ride._id,
      pickupLocation: ride.pickupLocation,
      destination: ride.destination,
      vehicle: ride.vehicle
        ? {
            id: ride.vehicle._id,
            type: ride.vehicle.type,
            description: ride.vehicle.description,
            pricePerKm: ride.vehicle.pricePerKm,
          }
        : null,
      rideOtp: ride.rideOtp,
      distance: ride.distance,
      fare: ride.fare,
      status: ride.status,
      driver: ride.driver,
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
      rating: ride.rating,
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ride: rideResponse,
      },
    });
  } catch (error) {
    console.error("Error fetching ride:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching ride",
      error: error.message,
    });
  }
};

// Get user's ride history
const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ customer: req.user.id })
      .populate("driver", "firstName lastName phone vehicleDetails")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    // Map rides to include vehicle details
    const ridesWithVehicleDetails = rides.map((ride) => {
      return {
        id: ride._id,
        pickupLocation: ride.pickupLocation,
        destination: ride.destination,
        vehicle: ride.vehicle
          ? {
              id: ride.vehicle._id,
              type: ride.vehicle.type,
              description: ride.vehicle.description,
              pricePerKm: ride.vehicle.pricePerKm,
            }
          : null,
        distance: ride.distance,
        fare: ride.fare,
        status: ride.status,
        driver: ride.driver,
        createdAt: ride.createdAt,
        updatedAt: ride.updatedAt,
        rating: ride.rating,
      };
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        rides: ridesWithVehicleDetails,
        count: ridesWithVehicleDetails.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user rides:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching rides",
      error: error.message,
    });
  }
};

// Get driver's ride history
const getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user.id })
      .populate("customer", "firstName lastName phone")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    // Map rides to include vehicle details
    const ridesWithDetails = rides.map((ride) => {
      return {
        id: ride._id,
        pickupLocation: ride.pickupLocation,
        destination: ride.destination,
        vehicle: ride.vehicle
          ? {
              id: ride.vehicle._id,
              type: ride.vehicle.type,
              description: ride.vehicle.description,
              pricePerKm: ride.vehicle.pricePerKm,
            }
          : null,
        distance: ride.distance,
        fare: ride.fare,
        status: ride.status,
        customer: ride.customer,
        createdAt: ride.createdAt,
        updatedAt: ride.updatedAt,
        rating: ride.rating,
      };
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        rides: ridesWithDetails,
        count: ridesWithDetails.length,
      },
    });
  } catch (error) {
    console.error("Error fetching driver rides:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while fetching rides",
      error: error.message,
    });
  }
};

module.exports = {
  createRide,
  getRideById,
  getUserRides,
  getDriverRides,
};
