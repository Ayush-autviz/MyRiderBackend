const { StatusCodes } = require("http-status-codes");
const FellowDriver = require("../models/FellowDriver");
const Driver = require("../models/Driver");

// Add a new fellow driver
const addFellowDriver = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { name, gender, mobileNumber, licenseNumber } = req.body;

    // Check if files are uploaded
    if (!req.files || !req.files.profilePhoto || !req.files.drivingLicenseFront || !req.files.drivingLicenseBack) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Profile photo and both sides of driving license are required",
      });
    }

    // Validate required fields
    if (!name || !gender || !mobileNumber || !licenseNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Name, gender, mobile number, and license number are required",
      });
    }

    // Check if driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Create fellow driver
    const fellowDriver = new FellowDriver({
      driver: driverId,
      name,
      gender,
      mobileNumber,
      profilePhoto: req.files.profilePhoto[0].path,
      drivingLicense: {
        front: req.files.drivingLicenseFront[0].path,
        back: req.files.drivingLicenseBack[0].path,
        licenseNumber,
      },
    });

    await fellowDriver.save();

    // Add fellow driver to driver's fellowDrivers array
    driver.fellowDrivers.push(fellowDriver._id);
    await driver.save();

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Fellow driver added successfully. Pending admin approval.",
      data: {
        fellowDriver: {
          id: fellowDriver._id,
          name: fellowDriver.name,
          gender: fellowDriver.gender,
          mobileNumber: fellowDriver.mobileNumber,
          approvalStatus: fellowDriver.approvalStatus,
          createdAt: fellowDriver.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error adding fellow driver:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to add fellow driver",
    });
  }
};

// Get all fellow drivers for a driver
const getFellowDrivers = async (req, res) => {
  try {
    const driverId = req.user.id;

    const fellowDrivers = await FellowDriver.find({
      driver: driverId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        fellowDrivers: fellowDrivers.map(fd => ({
          id: fd._id,
          name: fd.name,
          gender: fd.gender,
          mobileNumber: fd.mobileNumber,
          profilePhoto: fd.profilePhoto,
          licenseNumber: fd.drivingLicense.licenseNumber,
          approvalStatus: fd.approvalStatus,
          rejectionReason: fd.rejectionReason,
          createdAt: fd.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching fellow drivers:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch fellow drivers",
    });
  }
};

// Get approved fellow drivers for a driver
const getApprovedFellowDrivers = async (req, res) => {
  try {
    const driverId = req.user.id;

    const fellowDrivers = await FellowDriver.getApprovedByDriver(driverId);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        fellowDrivers: fellowDrivers.map(fd => ({
          id: fd._id,
          name: fd.name,
          gender: fd.gender,
          mobileNumber: fd.mobileNumber,
          profilePhoto: fd.profilePhoto,
          licenseNumber: fd.drivingLicense.licenseNumber,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching approved fellow drivers:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch approved fellow drivers",
    });
  }
};

// Update fellow driver
const updateFellowDriver = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { fellowDriverId } = req.params;
    const { name, gender, mobileNumber, licenseNumber } = req.body;

    const fellowDriver = await FellowDriver.findOne({
      _id: fellowDriverId,
      driver: driverId,
      isActive: true,
    });

    if (!fellowDriver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Fellow driver not found",
      });
    }

    // Only allow updates if pending or rejected
    if (fellowDriver.approvalStatus === "approved") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Cannot update approved fellow driver",
      });
    }

    // Update fields
    if (name) fellowDriver.name = name;
    if (gender) fellowDriver.gender = gender;
    if (mobileNumber) fellowDriver.mobileNumber = mobileNumber;
    if (licenseNumber) fellowDriver.drivingLicense.licenseNumber = licenseNumber;

    // Update files if provided
    if (req.files) {
      if (req.files.profilePhoto) {
        fellowDriver.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.drivingLicenseFront) {
        fellowDriver.drivingLicense.front = req.files.drivingLicenseFront[0].path;
      }
      if (req.files.drivingLicenseBack) {
        fellowDriver.drivingLicense.back = req.files.drivingLicenseBack[0].path;
      }
    }

    // Reset approval status to pending if it was rejected
    if (fellowDriver.approvalStatus === "rejected") {
      fellowDriver.approvalStatus = "pending";
      fellowDriver.rejectionReason = undefined;
    }

    await fellowDriver.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Fellow driver updated successfully",
      data: {
        fellowDriver: {
          id: fellowDriver._id,
          name: fellowDriver.name,
          gender: fellowDriver.gender,
          mobileNumber: fellowDriver.mobileNumber,
          approvalStatus: fellowDriver.approvalStatus,
        },
      },
    });
  } catch (error) {
    console.error("Error updating fellow driver:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update fellow driver",
    });
  }
};

// Delete fellow driver
const deleteFellowDriver = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { fellowDriverId } = req.params;

    const fellowDriver = await FellowDriver.findOne({
      _id: fellowDriverId,
      driver: driverId,
      isActive: true,
    });

    if (!fellowDriver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Fellow driver not found",
      });
    }

    // Soft delete
    fellowDriver.isActive = false;
    await fellowDriver.save();

    // Remove from driver's fellowDrivers array
    await Driver.findByIdAndUpdate(driverId, {
      $pull: { fellowDrivers: fellowDriverId },
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Fellow driver deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fellow driver:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete fellow driver",
    });
  }
};

module.exports = {
  addFellowDriver,
  getFellowDrivers,
  getApprovedFellowDrivers,
  updateFellowDriver,
  deleteFellowDriver,
};
