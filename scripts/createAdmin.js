require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = new Admin({
      username: "admin",
      email: "admin@rider.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "super_admin",
      permissions: [
        'users_read', 'users_write', 'users_delete',
        'drivers_read', 'drivers_write', 'drivers_delete', 'drivers_approve',
        'rides_read', 'rides_write', 'rides_cancel',
        'analytics_read', 'system_settings'
      ],
      isActive: true,
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Email: admin@rider.com");
    console.log("Role: super_admin");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
