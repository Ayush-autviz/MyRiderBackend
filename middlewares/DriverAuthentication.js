const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");

const authDriver = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.driver = { id: payload.id, phone: payload.phone, role: payload.role };
    req.socket = req.io;

    const user = await Driver.findById(payload.id);

    if (!user) {
      throw new Error("User not found");
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = authDriver;
