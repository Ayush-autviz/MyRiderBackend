const cron = require("node-cron");
const Driver = require("../models/Driver");

/**
 * Cron job to check driver heartbeats and force offline inactive drivers
 * Runs every minute to check all online drivers
 */
const startHeartbeatChecker = (io) => {
  console.log("Starting heartbeat checker cron job...");

  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Running heartbeat check for all online drivers...");

      // Find all drivers that are currently available
      const onlineDrivers = await Driver.find({
        isAvailable: true,
        lastHeartbeat: { $exists: true, $ne: null },
      });

      if (onlineDrivers.length === 0) {
        console.log("No online drivers to check");
        return;
      }

      console.log(
        `Checking heartbeat for ${onlineDrivers.length} online drivers`
      );

      const now = new Date();
      const inactiveDrivers = [];

      // Check each driver's last heartbeat
      for (const driver of onlineDrivers) {
        const timeDiff = (now - new Date(driver.lastHeartbeat)) / 1000 / 60; // minutes

        // If driver has been inactive for more than 10 minutes
        if (timeDiff > 10) {
          inactiveDrivers.push({
            id: driver._id,
            name: `${driver.firstName || ""} ${driver.lastName || ""}`.trim(),
            timeDiff: Math.round(timeDiff),
          });
        }
      }

      if (inactiveDrivers.length === 0) {
        console.log("All online drivers are active");
        return;
      }

      console.log(
        `Found ${inactiveDrivers.length} inactive drivers to force offline`
      );

      // Force offline inactive drivers
      const forceOfflinePromises = inactiveDrivers.map(async (driverInfo) => {
        try {
          // Update driver status in database
          await Driver.findByIdAndUpdate(driverInfo.id, {
            isAvailable: false,
            lastHeartbeat: null,
            liveRequests: [],
            liveFellowDriver: null,
          });

          // Emit socket event to notify the driver
          io.to(`driver_${driverInfo.id}`).emit("forceOffline", {
            message:
              "Inactivity timeout - You have been automatically taken offline",
          });

          console.log(
            `Driver ${driverInfo.name} (${driverInfo.id}) forced offline due to ${driverInfo.timeDiff} minutes of inactivity`
          );

          return driverInfo;
        } catch (error) {
          console.error(
            `Error forcing driver ${driverInfo.id} offline:`,
            error
          );
          return null;
        }
      });

      const results = await Promise.all(forceOfflinePromises);
      const successCount = results.filter((result) => result !== null).length;

      console.log(
        `Successfully forced ${successCount}/${inactiveDrivers.length} inactive drivers offline`
      );
    } catch (error) {
      console.error("Error in heartbeat checker cron job:", error);
    }
  });

  console.log("Heartbeat checker cron job started - will run every minute");
};

module.exports = { startHeartbeatChecker };
