const jwt = require("jsonwebtoken");
const geolib = require("geolib");
const User = require("../models/User");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");

const handleSocketConnection = (io) => {
  console.log("handling socket", io);
  // Authentication middleware
  io.use(async (socket, next) => {
    console.log("entered in middleware");
    console.log("socket ", socket.handshake);
    const token = socket.handshake.auth.access_token;
    if (!token) {
      console.log("No token provided");
      return next(new Error("Authentication invalid: No token provided"));
    }
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("payload", payload);
      if (!payload) {
        return next(new Error("Authentication invalid: Invalid token"));
      }
      if (payload.role === "driver") {
        const user = await Driver.findById(payload.id);
        if (!user) {
          return next(new Error("Authentication invalid: User not found"));
        }
        socket.user = { id: payload.id, role: user.role };
        next();
      } else if (payload.role === "customer") {
        const user = await User.findById(payload.id);
        if (!user) {
          return next(new Error("Authentication invalid: User not found"));
        }
        socket.user = { id: payload.id, role: payload.role };
        next();
      }
    } catch (error) {
      console.error("Socket Authentication Error:", error.message);
      return next(new Error("Authentication invalid"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.id}, Role: ${user.role}`);

    /**
     * DRIVER EVENTS
     */
    if (user.role === "driver") {
      // Driver goes online
      socket.on("goOnDuty", async (coords) => {
        try {
          await Driver.findByIdAndUpdate(user.id, {
            isAvailable: true,
            currentLocation: {
              type: "Point",
              coordinates: [coords.longitude, coords.latitude],
            },
            lastHeartbeat: new Date(),
            "currentLocation.lastUpdated": new Date(),
          });
          socket.join("availableDrivers");
          console.log(`Driver ${user.id} is now available.`);
        } catch (error) {
          console.error("Error setting driver available:", error);
        }
      });

      // Driver goes offline
      socket.on("goOffDuty", async () => {
        try {
          await Driver.findByIdAndUpdate(user.id, {
            isAvailable: false,
            lastHeartbeat: null,
            liveRequests: [],
          });
          socket.leave("availableDrivers");
          console.log(`Driver ${user.id} is now unavailable.`);
        } catch (error) {
          console.error("Error setting driver unavailable:", error);
        }
      });

      // Driver updates location
      socket.on("updateLocation", async (coords) => {
        try {
          await Driver.findByIdAndUpdate(user.id, {
            $set: {
              currentLocation: {
                type: "Point",
                coordinates: [coords.longitude, coords.latitude],
              },
              lastHeartbeat: new Date(),
              "currentLocation.lastUpdated": new Date(),
            },
          });

          // Notify subscribed customers
          socket.to(`driver_${user.id}`).emit("driverLocationUpdate", {
            driverId: user.id,
            coords: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          });
          console.log(`Updated location for driver ${user.id}`);
        } catch (error) {
          console.error("Error updating location:", error);
        }
      });

      // Driver accepts ride
      socket.on("acceptRide", async (rideId) => {
        try {
          const ride = await Ride.findById(rideId).populate("vehicle");
          if (!ride) {
            socket.emit("error", { message: "Ride not found" });
            return;
          }
          if (ride.status !== "searchingDriver") {
            socket.emit("error", { message: "Ride is no longer available" });
            return;
          }

          const driver = await Driver.findById(user.id);
          if (!driver.liveRequests.some((req) => req.rideId.equals(rideId))) {
            socket.emit("error", {
              message: "Ride request not assigned to you",
            });
            return;
          }

          // Calculate fare based on distance and vehicle pricePerKm
          if (ride.distance && ride.vehicle.pricePerKm) {
            ride.fare = ride.distance * ride.vehicle.pricePerKm;
          }

          // Update ride and driver
          ride.driver = user.id;
          ride.status = "accepted";
          await ride.save();

          await Driver.findByIdAndUpdate(user.id, {
            isAvailable: false,
            currentRide: rideId,
            $pull: { liveRequests: { rideId } },
          });

          // Notify customer
          socket.to(`customer_${ride.customer}`).emit("rideAccepted", {
            rideId,
            driverId: user.id,
            driver: await Driver.findById(user.id).select(
              "firstName lastName vehicleDetails currentLocation"
            ),
          });

          // Subscribe customer to driver's location
          socket
            .to(`customer_${ride.customer}`)
            .emit("subscribeToDriverLocation", user.id);

          // Notify other drivers that ride is taken and remove from their liveRequests
          const nearbyDrivers = await Driver.find({
            "liveRequests.rideId": rideId,
          });
          nearbyDrivers.forEach(async (nearbyDriver) => {
            socket
              .to(`driver_${nearbyDriver._id}`)
              .emit("rideTaken", { rideId });
            await Driver.findByIdAndUpdate(nearbyDriver._id, {
              $pull: { liveRequests: { rideId } },
            });
          });

          console.log(`Driver ${user.id} accepted ride ${rideId}`);
        } catch (error) {
          console.error("Error accepting ride:", error);
          socket.emit("error", { message: "Error accepting ride" });
        }
      });

      // Heartbeat check
      const checkHeartbeat = setInterval(async () => {
        try {
          const driver = await Driver.findById(user.id);
          if (driver && driver.isAvailable && driver.lastHeartbeat) {
            const timeDiff =
              (new Date() - new Date(driver.lastHeartbeat)) / 1000 / 60; // minutes
            if (timeDiff > 10) {
              await Driver.findByIdAndUpdate(user.id, {
                isAvailable: false,
                lastHeartbeat: null,
                liveRequests: [],
              });
              socket.leave("availableDrivers");
              socket.emit("forceOffline", { message: "Inactivity timeout" });
              console.log(`Driver ${user.id} forced offline due to inactivity`);
            }
          }
        } catch (error) {
          console.error("Error checking heartbeat:", error);
        }
      }, 60000); // Check every minute

      socket.on("disconnect", async () => {
        try {
          await Driver.findByIdAndUpdate(user.id, {
            liveRequests: [],
          });
          clearInterval(checkHeartbeat);
        } catch (error) {
          console.error("Error on driver disconnect:", error);
        }
      });
    }

    /**
     * CUSTOMER EVENTS
     */
    if (user.role === "customer") {
      // Customer books a ride
      socket.on("bookRide", async (rideId) => {
        try {
          // Fetch ride details
          const ride = await Ride.findById(rideId).populate("vehicle");
          if (!ride) {
            socket.emit("error", { message: "Ride not found" });
            return;
          }
          if (ride.customer.toString() !== user.id) {
            socket.emit("error", {
              message: "Unauthorized: Ride does not belong to this customer",
            });
            return;
          }
          if (ride.status !== "searchingDriver") {
            socket.emit("error", {
              message: "Ride is not in searchingDriver status",
            });
            return;
          }

          // Validate vehicle
          const vehicle = await Vehicle.findById(ride.vehicle);
          if (!vehicle) {
            socket.emit("error", { message: "Invalid vehicle type" });
            return;
          }

          // Determine if extra driver is needed
          const needsExtraDriver = vehicle.type.includes("WithExtraDriver");

          // Emit findRiders event
          socket.emit("findRiders", {
            rideId: ride._id,
            rideDetails: {
              customerId: user.id,
              pickupLocation: ride.pickupLocation,
              destination: ride.destination,
              vehicle: vehicle,
              status: ride.status,
              createdAt: ride.createdAt,
            },
          });

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
                    ride.pickupLocation.coordinates[0],
                    ride.pickupLocation.coordinates[1],
                  ],
                  5 / 6378.1, // 5km radius
                ],
              },
            },
          });

          if (nearbyDrivers.length === 0) {
            ride.status = "noDriversFound";
            await ride.save();
            socket.emit("noDriversAvailable", {
              message: "No drivers available nearby",
            });
            console.log(
              `Ride ${ride._id} marked as noDriversFound: no drivers available`
            );
            return;
          }

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

          socket.join(`customer_${user.id}`);
          console.log(
            `Ride ${ride._id} created for customer ${user.id}, sent to ${nearbyDrivers.length} drivers`
          );
        } catch (error) {
          console.error("Error booking ride:", error);
          socket.emit("error", { message: "Error booking ride" });
        }
      });

      // Customer searches for nearby drivers
      socket.on("searchNearbyDrivers", async (pickupCoords) => {
        try {
          const nearbyDrivers = await Driver.find({
            isAvailable: true,
            currentRide: null,
            currentLocation: {
              $geoWithin: {
                $centerSphere: [
                  [pickupCoords.longitude, pickupCoords.latitude],
                  5 / 6378.1, // 5km radius
                ],
              },
            },
          });

          socket.emit("nearbyDrivers", nearbyDrivers);
          console.log(
            `Found ${nearbyDrivers.length} drivers nearby for ${user.id}`
          );
        } catch (error) {
          console.error("Error finding nearby drivers:", error);
          socket.emit("error", { message: "Error finding nearby drivers" });
        }
      });

      // Subscribe to driver location
      socket.on("subscribeToDriverLocation", async (driverId) => {
        try {
          const driver = await Driver.findById(driverId);
          if (driver) {
            socket.join(`driver_${driverId}`);
            socket.emit("driverLocationUpdate", {
              driverId,
              coords: {
                latitude: driver.currentLocation.coordinates[1],
                longitude: driver.currentLocation.coordinates[0],
              },
            });
            console.log(`Customer ${user.id} subscribed to Driver ${driverId}`);
          } else {
            socket.emit("error", { message: "Driver not found" });
          }
        } catch (error) {
          console.error("Error subscribing to driver:", error);
          socket.emit("error", { message: "Something went wrong" });
        }
      });
    }

    /**
     * COMMON EVENTS
     */
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });
};

module.exports = handleSocketConnection;
