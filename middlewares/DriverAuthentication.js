const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");

const authDriver = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  console.log(token, "driver Token");
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.id, phone: payload.phone, role: payload.role };
    req.socket = req.io;

    const user = await Driver.findById(payload.id);

    if (!user) {
      return res.status(404).json({ message: "Driver not found" });
    }

    next();
  } catch (error) {
    console.log(error, "error");
    return res.status(401).json({ message: "Authentication invalid" });
  }
};

module.exports = authDriver;
