require("dotenv").config();
const mongoose = require("mongoose");
const CommissionSettings = require("../models/CommissionSettings");
const Admin = require("../models/Admin");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const initializeCommissionSettings = async () => {
  try {
    console.log("Initializing commission settings...");

    // Check if commission setting already exists
    const existingSetting = await CommissionSettings.findOne({
      isActive: true,
    });

    if (existingSetting) {
      console.log(
        `- Commission setting already exists: ${existingSetting.commissionPercentage}%`
      );
      return;
    }

    // Create default global commission setting
    const commissionSetting = await CommissionSettings.create({
      commissionPercentage: 20, // Default 20% as requested
      description: "Global commission rate for all rides",
      isActive: true,
      lastUpdatedBy: null, // System created
    });

    console.log(
      `✓ Created global commission setting: ${commissionSetting.commissionPercentage}%`
    );
    console.log("Commission settings initialization completed!");
  } catch (error) {
    console.error("Error initializing commission settings:", error);
  }
};

const createSystemAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ username: "system" });

    if (!existingAdmin) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("system123", 10);

      await Admin.create({
        username: "system",
        email: "system@myrider.com",
        password: hashedPassword,
        firstName: "System",
        lastName: "Admin",
        role: "super_admin",
        permissions: [
          "users_read",
          "users_write",
          "users_delete",
          "drivers_read",
          "drivers_write",
          "drivers_delete",
          "drivers_approve",
          "rides_read",
          "rides_write",
          "rides_cancel",
          "analytics_read",
          "system_settings",
        ],
        isActive: true,
      });

      console.log(
        "✓ System admin created (username: system, password: system123)"
      );
    } else {
      console.log("- System admin already exists");
    }
  } catch (error) {
    console.error("Error creating system admin:", error);
  }
};

const main = async () => {
  console.log("🚀 Initializing Wallet System...\n");

  await connectDB();

  console.log("1. Creating system admin...");
  await createSystemAdmin();

  console.log("\n2. Initializing commission settings...");
  await initializeCommissionSettings();

  console.log("\n✅ Wallet system initialization completed!");
  console.log("\nNext steps:");
  console.log("1. Update your .env file with PayPal credentials");
  console.log("2. Test the wallet APIs using the documentation");
  console.log("3. Access admin panel to manage commission settings");

  process.exit(0);
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Run the script
main();
