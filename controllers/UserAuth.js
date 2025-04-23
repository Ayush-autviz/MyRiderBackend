const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// Generate 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP via Twilio
const sendOtp = async (phone, otp) => {
  const client = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    const message = await client.messages.create({
      body: `Your verification code is: ${otp}. It expires in 2 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log(`OTP sent successfully. SID: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

// Authenticate user and send OTP
const auth = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Phone number is required",
    });
  }

  try {
    let user = await User.findOne({ phone });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
      await sendOtp(phone, otp);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "OTP sent successfully",
        data: { existingUser: true },
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User not registered",
      data: { existingUser: false },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Register new user
const register = async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  if (!phone || !firstName || !email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Phone, firstName, and email are required",
    });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "User already exists with this phone or email",
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      otp,
      otpExpires,
    });

    await user.save();
    await sendOtp(phone, otp);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: { userId: user._id },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify OTP and generate tokens
const verifyOtp = async (req, res) => {
  const { otp, phone } = req.body;

  if (!otp || !phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "OTP and phone number are required",
    });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          firstName: user.firstName,
          email: user.email,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  try {
    const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = user.createAccessToken();
    const newRefreshToken = user.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

module.exports = {
  auth,
  register,
  verifyOtp,
  refreshToken,
};