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
    // console.log("socket ", socket.handshake);
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
        socket.user = { id: payload.id, role: payload.role };
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
      console.log("Driver events");

      // Driver joins their own room automatically on connection
      socket.join(`driver_${user.id}`);
      console.log(`Driver ${user.id} joined their personal room`);

      // Driver goes online
      socket.on("goOnDuty", async (coords) => {
        console.log(coords, "coords");
        try {
          // await Driver.findByIdAndUpdate(user.id, {
          //   isAvailable: true,
          //   currentLocation: {
          //     type: "Point",
          //     coordinates: [coords.longitude, coords.latitude],
          //     lastUpdated: new Date(),
          //   },
          //   lastHeartbeat: new Date(),
          // });
          socket.join("availableDrivers");
          console.log(`Driver ${user.id} is now available.`);
        } catch (error) {
          console.error("Error setting driver available:", error);
        }
      });

      // Driver joins a specific ride room
      socket.on("joinRideRoom", async (rideId) => {
        try {
          const ride = await Ride.findById(rideId);
          if (!ride) {
            socket.emit("error", { message: "Ride not found" });
            return;
          }

          if (ride.driver && ride.driver.toString() === user.id) {
            socket.join(`ride_${rideId}`);
            console.log(
              `Driver ${user.id} joined ride room for ride ${rideId}`
            );
            socket.emit("roomJoined", { room: `ride_${rideId}` });
          } else {
            socket.emit("error", {
              message: "Not authorized to join this ride room",
            });
          }
        } catch (error) {
          console.error("Error joining ride room:", error);
          socket.emit("error", { message: "Error joining ride room" });
        }
      });

      // Driver goes offline
      socket.on("goOffDuty", async () => {
        try {
          await Driver.findByIdAndUpdate(user.id, {
            isAvailable: false,
            withExtraDriver: false,
            lastHeartbeat: null,
            liveRequests: [],
          });
          socket.leave("availableDrivers");
          console.log(`Driver ${user.id} is now offline.`);
        } catch (error) {
          console.error("Error setting driver offline:", error);
        }
      });

      // Driver updates location
      socket.on("updateLocation", async (coords) => {
        try {
          // Update driver location
          await Driver.findByIdAndUpdate(user.id, {
            currentLocation: {
              type: "Point",
              coordinates: [coords.longitude, coords.latitude],
              lastUpdated: new Date(),
            },
            lastHeartbeat: new Date(),
          });

          // Find driver with populated currentRide to get customer info
          const driverWithRide = await Driver.findById(user.id).populate('currentRide');
          
          // Notify subscribed customers (existing functionality)
          socket.to(`driver_${user.id}`).emit("driverLocationUpdate", {
            driverId: user.id,
            coords: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          });

          // If driver has an active ride, also emit to the customer
          if (driverWithRide && driverWithRide.currentRide && driverWithRide.currentRide.customer) {
            const customerId = driverWithRide.currentRide.customer.toString();
            socket.to(`customer_${customerId}`).emit("driverLocationUpdate", {
              driverId: user.id,
              coords: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
              rideId: driverWithRide.currentRide._id,
            });
            console.log(`Updated location for driver ${user.id} and notified customer ${customerId}`);
          } else {
            console.log(`Updated location for driver ${user.id} (no active ride)`);
          }
        } catch (error) {
          console.error("Error updating location:", error);
        }
      });

      socket.on("disconnect", async () => {
        try {
          await Driver.findByIdAndUpdate(user.id, {
            liveRequests: [],
          });
        } catch (error) {
          console.error("Error on driver disconnect:", error);
        }
      });
    }

    /**
     * CUSTOMER EVENTS
     */
    if (user.role === "customer") {
      // Customer joins their own room automatically on connection
      socket.join(`customer_${user.id}`);
      console.log(`Customer ${user.id} joined their personal room`);

      // Customer joins a specific ride room
      socket.on("joinRideRoom", async (rideId) => {
        try {
          const ride = await Ride.findById(rideId);
          if (!ride) {
            socket.emit("error", { message: "Ride not found" });
            return;
          }

          if (ride.customer.toString() === user.id) {
            socket.join(`ride_${rideId}`);
            console.log(
              `Customer ${user.id} joined ride room for ride ${rideId}`
            );
            socket.emit("roomJoined", { room: `ride_${rideId}` });
          } else {
            socket.emit("error", {
              message: "Not authorized to join this ride room",
            });
          }
        } catch (error) {
          console.error("Error joining ride room:", error);
          socket.emit("error", { message: "Error joining ride room" });
        }
      });

      // Customer books a ride
      socket.on("bookRide", async (rideId) => {
        console.log("book ride", rideId);
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

          console.log("hii");

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
            // currentLocation: {
            //   $geoWithin: {
            //     $centerSphere: [
            //       [
            //         ride.pickupLocation.coordinates[0],
            //         ride.pickupLocation.coordinates[1],
            //       ],
            //       5 / 6378.1, // 5km radius
            //     ],
            //   },
            // },
          });

          if (nearbyDrivers.length === 0) {
            ride.status = "noDriversFound";
            await ride.save();

            // Clear user's currentRide field since no drivers were found
            await User.findByIdAndUpdate(user.id, {
              currentRide: null,
            });

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
        console.log("search nearby drivers", pickupCoords);

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
