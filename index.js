require("dotenv").config();


const express = require("express");
const http = require("http");



// Routers
const authRouter = require("./routes/auth");
const connectDB = require("./config/connect");


// Import socket handler

const app = express();
app.use(express.json());
const server = http.createServer(app);


// Routes
app.use("/auth", authRouter);
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT || 3000, () =>
      console.log(
        `HTTP server is running on port http://localhost:${
          process.env.PORT || 3000
        }`
      )
    );
  } catch (error) {
    console.log(error);
  }
};

start();
