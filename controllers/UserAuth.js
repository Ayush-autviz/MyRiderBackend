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
      // Existing user - update OTP
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // New user - create temporary user record
      user = new User({
        phone,
        otp,
        otpExpires,
        registrationComplete: false
      });
      await user.save();
    }

    // Send OTP for both new and existing users
    await sendOtp(phone, otp);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        existingUser: user.registrationComplete,
        registrationComplete: user.registrationComplete
      },
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

  if (!phone || !firstName) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Phone and firstName are required",
    });
  }

  try {
    // Find the user by phone number
    let user = await User.findOne({ phone });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "User not found. Please verify your phone number first.",
      });
    }

    if (user.registrationComplete) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "User is already registered",
      });
    }

    // Update user information
    user.firstName = firstName;
    user.lastName = lastName || '';
    user.email = email || '';
    user.registrationComplete = true;

    await user.save();

    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          registrationComplete: user.registrationComplete
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      },
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
      message: "OTP verified successfully",
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          registrationComplete: user.registrationComplete
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