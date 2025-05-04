const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs").promises;
const path = require("path");

// Create uploads directory if it doesn't exist
const ensureUploadsDir = async () => {
  const uploadDir = path.join(__dirname, '../uploads/user-profiles');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
  return uploadDir;
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-otp -otpExpires -__v')
      .lean();

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit user profile
const editUserProfile = async (req, res) => {
  // Check if req.body is defined
  if (!req.body) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Request body is missing",
    });
  }

  const firstName = req.body.firstName || null;
  const lastName = req.body.lastName || null;
  const email = req.body.email || null;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Update text fields if provided
    if (firstName !== null) user.firstName = firstName;
    if (lastName !== null) user.lastName = lastName;
    if (email !== null) user.email = email;

    // Handle profile image update
    let oldProfileImage = null;
    if (req.file) {
      // Save old profile image path for deletion
      oldProfileImage = user.profileImage;
      
      // Update profile image path
      user.profileImage = req.file.path;
    }

    await user.save();

    // Delete old profile image after successful save
    if (oldProfileImage) {
      try {
        await fs.unlink(oldProfileImage);
      } catch (err) {
        console.error(`Failed to delete old profile image ${oldProfileImage}:`, err);
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User profile updated successfully",
      data: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  editUserProfile
};
