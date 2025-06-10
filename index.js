require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");

// Routers
const authRouter = require("./routes/auth");
const driverAuthRouter = require("./routes/driverAuth");
const vehicleRouter = require("./routes/vehicle");
const rideRouter = require("./routes/ride");
const rideStatusRouter = require("./routes/rideStatus");
const userProfileRouter = require("./routes/userProfile");
const ratingRouter = require("./routes/rating");
const adminRouter = require("./routes/admin");

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
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

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

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB(process.env.MONGO_URI);

    // Seed vehicle data if needed
    await seedVehicles();

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
