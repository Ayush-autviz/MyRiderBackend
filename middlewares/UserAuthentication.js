const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  console.log("auth middleware");
  const authHeader = req?.headers?.authorization;
  console.log(authHeader, "authHeader");
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.id, phone: payload.phone, role: payload.role };
    req.socket = req.io;

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.log(error, "error");
    return res.status(401).json({ message: "Authentication invalid" });
  }
};

module.exports = auth;
