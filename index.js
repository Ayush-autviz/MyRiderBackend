require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");
const CommissionSettings = require("./models/CommissionSettings");

// Routers
const authRouter = require("./routes/auth");
const driverAuthRouter = require("./routes/driverAuth");
const vehicleRouter = require("./routes/vehicle");
const rideRouter = require("./routes/ride");
const rideStatusRouter = require("./routes/rideStatus");
const userProfileRouter = require("./routes/userProfile");
const ratingRouter = require("./routes/rating");
const adminRouter = require("./routes/admin");
const adminEarningsRouter = require("./routes/adminEarnings");
const walletRouter = require("./routes/wallet");
const driverWalletRouter = require("./routes/driverWallet");

const connectDB = require("./config/connect");
const { swaggerSpec, swaggerUi } = require("./config/swagger");
const seedVehicles = require("./utils/seedVehicles");

const handleSocketConnection = require("./controllers/Socket");
const { startHeartbeatChecker } = require("./jobs/heartbeatChecker");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // For parsing multipart/form-data

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*" } });

// Attach the WebSocket instance to the request object
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Welcome route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Rider Backend API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .btn { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px;
                text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .btn:hover { background: #45a049; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Rider Backend API</h1>
          <p>This is the backend server for the Rider application.</p>
          <p>Use the link below to access the API documentation:</p>
          <a href="/api-docs" class="btn">API Documentation</a>
        </div>
      </body>
    </html>
  `);
});

handleSocketConnection(io);

// Start heartbeat checker cron job
startHeartbeatChecker(io);

// Routes
app.use("/auth", authRouter);
app.use("/driverAuth", driverAuthRouter);
app.use("/vehicle", vehicleRouter);
app.use("/ride", rideRouter);
app.use("/ride-status", rideStatusRouter);
app.use("/user/profile", userProfileRouter);
app.use("/rating", ratingRouter);
app.use("/admin", adminRouter);
app.use("/admin/earnings", adminEarningsRouter);
app.use("/wallet", walletRouter);
app.use("/driver/wallet", driverWalletRouter);

// Initialize commission settings
const initializeCommission = async () => {
  try {
    const existingSetting = await CommissionSettings.findOne({
      isActive: true,
    });
    if (!existingSetting) {
      await CommissionSettings.create({
        commissionPercentage: 20,
        description: "Default global commission rate",
        isActive: true,
      });
      console.log("✓ Initialized default commission setting: 20%");
    }
  } catch (error) {
    console.error("Error initializing commission:", error);
  }
};

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB(process.env.MONGO_URI);

    // Seed vehicle data if needed
    await seedVehicles();

    // Initialize commission settings
    await initializeCommission();

    // Start the server
    server.listen(process.env.PORT || 4000, () =>
      console.log(
        `HTTP server is running on port http://localhost:${
          process.env.PORT || 4000
        }`
      )
    );
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
