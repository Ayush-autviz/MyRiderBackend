const Driver = require("../models/Driver");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs").promises;

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

const auth = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Phone number is required",
    });
  }

  try {
    let driver = await Driver.findOne({ phone });
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    if (driver) {
      // Existing driver - update OTP
      driver.otp = otp;
      driver.otpExpires = otpExpires;
      await driver.save();
    } else {
      // New driver - create temporary driver record
      driver = new Driver({
        phone,
        otp,
        otpExpires,
        registrationComplete: false,
        accountStatus: "VehiclePending",
      });
      await driver.save();
    }

    // Send OTP for both new and existing drivers
    await sendOtp(phone, otp);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        existingUser: driver.registrationComplete,
        registrationComplete: driver.registrationComplete,
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

const verifyOtp = async (req, res) => {
  const { otp, phone } = req.body;

  if (!otp || !phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "OTP and phone number are required",
    });
  }

  try {
    const driver = await Driver.findOne({ phone });

    if (!driver) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "User not found",
      });
    }

    if (driver.otp !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (driver.otpExpires < new Date()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Clear OTP after successful verification
    driver.otp = null;
    driver.otpExpires = null;
    await driver.save();

    const accessToken = driver.createAccessToken();
    const refreshToken = driver.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        user: {
          id: driver._id,
          phone: driver.phone,
          firstName: driver.firstName || "",
          lastName: driver.lastName || "",
          email: driver.email || "",
          registrationComplete: driver.registrationComplete,
          accountStatus: driver.accountStatus,
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

const registerDriver = async (req, res) => {
  // Check if req.body is defined
  if (!req.body) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Request body is missing",
    });
  }

  // Safely access fields with fallback
  const phone = req.body.phone || null;
  const firstName = req.body.firstName || "";
  const lastName = req.body.lastName || "";
  const email = req.body.email || "";

  if (!phone || !firstName) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Phone and firstName are required",
    });
  }

  try {
    // Find the driver by phone number
    let driver = await Driver.findOne({ phone });

    if (!driver) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Driver not found. Please verify your phone number first.",
      });
    }

    if (driver.registrationComplete) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Driver is already registered",
      });
    }

    // Update driver information
    driver.firstName = firstName;
    driver.lastName = lastName || "";
    driver.email = email || "";
    driver.registrationComplete = true;

    await driver.save();

    const accessToken = driver.createAccessToken();
    const refreshToken = driver.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver registered successfully",
      data: {
        user: {
          id: driver._id,
          phone: driver.phone,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          registrationComplete: driver.registrationComplete,
          accountStatus: driver.accountStatus,
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

const submitVehicleDetails = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { brand, model, year, color, licensePlate, vehicleType } = req.body;

    // Check for required fields
    if (!brand || !model || !licensePlate || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: "Brand, model, license plate, and vehicle type are required",
      });
    }

    // Get file paths from the request
    const vehicleImage = req.files.vehicleImage
      ? req.files.vehicleImage[0].path
      : null;
    const numberPlateImage = req.files.numberPlateImage
      ? req.files.numberPlateImage[0].path
      : null;

    // Check if required images are provided
    if (!vehicleImage || !numberPlateImage) {
      return res.status(400).json({
        success: false,
        message: "Vehicle image and number plate image are required",
      });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    driver.vehicleType = vehicleType;
    driver.vehicleDetails = {
      brand,
      model,
      year: year || null,
      color: color || "",
      licensePlate,
      vehicleImage: {
        image: vehicleImage,
        verified: false,
      },
      numberPlateImage: {
        image: numberPlateImage,
        verified: false,
      },
    };

    driver.accountStatus = "DocumentsPending";
    await driver.save();

    res.status(200).json({
      success: true,
      message: "Vehicle details submitted successfully",
      data: {
        driverId: driver._id,
        vehicleDetails: driver.vehicleDetails,
        accountStatus: driver.accountStatus,
      },
    });
  } catch (error) {
    console.error("Error submitting vehicle details:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Upload Documents
const uploadDocuments = async (req, res) => {
  console.log("upload documnets");
  try {
    const { driverId } = req.params;
    const files = req.files;

    // Check for required documents
    if (
      !files.drivingLicenseFront ||
      !files.drivingLicenseBack ||
      !files.vehicleRegistration ||
      !files.profilePhoto
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required documents must be provided: driving license (front and back), vehicle registration, and profile photo",
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    driver.documents = {
      drivingLicense: {
        front: files.drivingLicenseFront[0].path,
        back: files.drivingLicenseBack[0].path,
        verified: false,
      },
      vehicleRegistration: {
        image: files.vehicleRegistration[0].path,
        verified: false,
      },
      profilePhoto: {
        image: files.profilePhoto[0].path,
        verified: false,
      },
    };

    driver.accountStatus = "ApprovalPending";
    await driver.save();

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      data: {
        driverId: driver._id,
        documents: driver.documents,
        accountStatus: driver.accountStatus,
      },
    });
  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getDriverDetails = async (req, res) => {
  try {
    console.log(req.user, "driver profile");

    const driver = await Driver.findById(req.user.id)
      .select("-otp -otpExpires -__v")
      .lean();

    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver details retrieved successfully",
      data: driver,
    });
  } catch (error) {
    console.error("Error retrieving driver details:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const editDriverDetails = async (req, res) => {
  // Check if req.body is defined
  if (!req.body) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Request body is missing",
    });
  }

  console.log(req.body);

  const firstName = req.body.firstName || null;
  const lastName = req.body.lastName || null;
  const email = req.body.email || null;

  try {
    const driver = await Driver.findById(req.user.id);
    console.log(driver, "driver");
    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Array to store old file paths for deletion
    const oldFilePaths = [];

    // Update text fields if provided
    if (firstName !== null) driver.firstName = firstName;
    if (lastName !== null) driver.lastName = lastName;
    if (email !== null) driver.email = email;

    // Handle profile photo update
    if (req.file) {
      const oldProfilePhotoPath = driver.documents.profilePhoto?.image;
      driver.documents.profilePhoto = {
        image: req.file.path,
        verified: false,
      };
      if (oldProfilePhotoPath) {
        oldFilePaths.push(oldProfilePhotoPath);
      }
    }

    await driver.save();

    // Delete old files after successful save
    for (const filePath of oldFilePaths) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete old file ${filePath}:`, err);
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver profile updated successfully",
      data: {
        driverId: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        profilePhoto: driver.documents.profilePhoto?.image,
      },
    });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/driver/go-online
const goOnline = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isAvailable = true;
    driver.withExtraDriver = true; // Normal online

    await driver.save();
    res.status(200).json({ message: "Driver is now online", driver });
  } catch (error) {
    console.error("Error in go-online:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/driver/go-online-with-extra
const goOnlineWithExtra = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isAvailable = true;
    driver.withExtraDriver = true; // Online with extra driver

    await driver.save();

    res
      .status(200)
      .json({ message: "Driver is now online with extra driver", driver });
  } catch (error) {
    console.error("Error in go-online-with-extra:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/driver/go-offline
const goOffline = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isAvailable = false;
    driver.withExtraDriver = false;
    driver.lastHeartbeat = null;

    // Clear any live requests
    driver.liveRequests = [];

    await driver.save();

    res.status(200).json({
      success: true,
      message: "Driver is now offline",
      driver,
    });
  } catch (error) {
    console.error("Error in go-offline:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update driver status from ApprovalPending to active
const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Driver ID is required",
      });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Check if driver is in ApprovalPending status
    if (driver.accountStatus !== "ApprovalPending") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot update driver status. Current status is ${driver.accountStatus}`,
      });
    }

    // Update driver status to active
    driver.accountStatus = "active";
    driver.isVerified = true;

    await driver.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver status updated to active",
      data: {
        driverId: driver._id,
        accountStatus: driver.accountStatus,
        isVerified: driver.isVerified,
      },
    });
  } catch (error) {
    console.error("Error updating driver status:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit vehicle details
const editVehicleDetails = async (req, res) => {
  console.log("editing driver");
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Array to store old file paths for deletion
    const oldFilePaths = [];

    // Get vehicle details from request body
    const { brand, model, year, color, licensePlate } = req.body;

    // Update vehicle details
    if (brand) driver.vehicleDetails.brand = brand;
    if (model) driver.vehicleDetails.model = model;
    if (year) driver.vehicleDetails.year = year;
    if (color) driver.vehicleDetails.color = color;
    if (licensePlate) driver.vehicleDetails.licensePlate = licensePlate;

    // Handle vehicle image update
    if (req.files && req.files.vehicleImage) {
      const oldVehicleImagePath = driver.vehicleDetails.vehicleImage?.image;
      driver.vehicleDetails.vehicleImage = {
        image: req.files.vehicleImage[0].path,
        verified: false,
      };
      if (oldVehicleImagePath) {
        oldFilePaths.push(oldVehicleImagePath);
      }
    }

    // Handle number plate image update
    if (req.files && req.files.numberPlateImage) {
      const oldNumberPlateImagePath =
        driver.vehicleDetails.numberPlateImage?.image;
      driver.vehicleDetails.numberPlateImage = {
        image: req.files.numberPlateImage[0].path,
        verified: false,
      };
      if (oldNumberPlateImagePath) {
        oldFilePaths.push(oldNumberPlateImagePath);
      }
    }

    await driver.save();

    // Delete old files after successful save
    for (const filePath of oldFilePaths) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete old file ${filePath}:`, err);
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Vehicle details updated successfully",
      data: {
        driverId: driver._id,
        vehicleDetails: driver.vehicleDetails,
      },
    });
  } catch (error) {
    console.error("Error updating vehicle details:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit driver documents
const editDriverDocuments = async (req, res) => {
  console.log("editing documents");
  try {
    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Array to store old file paths for deletion
    const oldFilePaths = [];
    let documentsUpdated = false;

    // Handle document updates
    if (req.files) {
      if (req.files.drivingLicenseFront) {
        oldFilePaths.push(driver.documents.drivingLicense.front);
        driver.documents.drivingLicense.front =
          req.files.drivingLicenseFront[0].path;
        driver.documents.drivingLicense.verified = false;
        documentsUpdated = true;
      }
      if (req.files.drivingLicenseBack) {
        oldFilePaths.push(driver.documents.drivingLicense.back);
        driver.documents.drivingLicense.back =
          req.files.drivingLicenseBack[0].path;
        driver.documents.drivingLicense.verified = false;
        documentsUpdated = true;
      }
      if (req.files.vehicleRegistration) {
        oldFilePaths.push(driver.documents.vehicleRegistration.image);
        driver.documents.vehicleRegistration.image =
          req.files.vehicleRegistration[0].path;
        driver.documents.vehicleRegistration.verified = false;
        documentsUpdated = true;
      }
    }

    // Set accountStatus to ApprovalPending if documents were updated
    if (documentsUpdated) {
      driver.accountStatus = "ApprovalPending";
      driver.isVerified = false;
    }

    await driver.save();

    // Delete old files after successful save
    for (const filePath of oldFilePaths) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Failed to delete old file ${filePath}:`, err);
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver documents updated successfully",
      data: {
        driverId: driver._id,
        documents: driver.documents,
        accountStatus: driver.accountStatus,
      },
    });
  } catch (error) {
    console.error("Error updating driver documents:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  auth,
  registerDriver,
  getDriverDetails,
  editDriverDetails,
  uploadDocuments,
  submitVehicleDetails,
  goOnline,
  goOnlineWithExtra,
  goOffline,
  verifyOtp,
  updateDriverStatus,
  editVehicleDetails,
  editDriverDocuments,
};
