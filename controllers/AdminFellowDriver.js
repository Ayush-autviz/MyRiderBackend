const { StatusCodes } = require("http-status-codes");
const FellowDriver = require("../models/FellowDriver");

// Get all fellow drivers with filtering
const getAllFellowDrivers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "all",
      search = "",
      driverId = "",
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    // Filter by approval status
    if (status !== "all") {
      query.approvalStatus = status;
    }

    // Filter by driver ID
    if (driverId) {
      query.driver = driverId;
    }

    // Search functionality
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
          { "drivingLicense.licenseNumber": { $regex: search, $options: "i" } },
        ],
      };
    }

    const finalQuery = { ...query, ...searchQuery };

    const [fellowDrivers, total] = await Promise.all([
      FellowDriver.find(finalQuery)
        .populate("driver", "firstName lastName phone email")
        .populate("approvedBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FellowDriver.countDocuments(finalQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        fellowDrivers: fellowDrivers.map(fd => ({
          id: fd._id,
          name: fd.name,
          gender: fd.gender,
          mobileNumber: fd.mobileNumber,
          profilePhoto: fd.profilePhoto,
          drivingLicense: fd.drivingLicense,
          approvalStatus: fd.approvalStatus,
          rejectionReason: fd.rejectionReason,
          driver: fd.driver,
          approvedBy: fd.approvedBy,
          approvedAt: fd.approvedAt,
          createdAt: fd.createdAt,
          updatedAt: fd.updatedAt,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
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

// Get pending fellow drivers for approval
const getPendingFellowDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const fellowDrivers = await FellowDriver.getPendingApprovals(page, limit);
    const total = await FellowDriver.countDocuments({
      approvalStatus: "pending",
      isActive: true,
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        fellowDrivers: fellowDrivers.map(fd => ({
          id: fd._id,
          name: fd.name,
          gender: fd.gender,
          mobileNumber: fd.mobileNumber,
          profilePhoto: fd.profilePhoto,
          drivingLicense: fd.drivingLicense,
          driver: fd.driver,
          createdAt: fd.createdAt,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching pending fellow drivers:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch pending fellow drivers",
    });
  }
};

// Get fellow driver details
const getFellowDriverDetails = async (req, res) => {
  try {
    const { fellowDriverId } = req.params;

    const fellowDriver = await FellowDriver.findById(fellowDriverId)
      .populate("driver", "firstName lastName phone email vehicleType")
      .populate("approvedBy", "username");

    if (!fellowDriver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Fellow driver not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        fellowDriver: {
          id: fellowDriver._id,
          name: fellowDriver.name,
          gender: fellowDriver.gender,
          mobileNumber: fellowDriver.mobileNumber,
          profilePhoto: fellowDriver.profilePhoto,
          drivingLicense: fellowDriver.drivingLicense,
          approvalStatus: fellowDriver.approvalStatus,
          rejectionReason: fellowDriver.rejectionReason,
          driver: fellowDriver.driver,
          approvedBy: fellowDriver.approvedBy,
          approvedAt: fellowDriver.approvedAt,
          createdAt: fellowDriver.createdAt,
          updatedAt: fellowDriver.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching fellow driver details:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch fellow driver details",
    });
  }
};

// Approve fellow driver
const approveFellowDriver = async (req, res) => {
  try {
    const { fellowDriverId } = req.params;
    const adminId = req.user.id;

    const fellowDriver = await FellowDriver.findById(fellowDriverId);

    if (!fellowDriver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Fellow driver not found",
      });
    }

    if (fellowDriver.approvalStatus !== "pending") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Fellow driver is not pending approval",
      });
    }

    await fellowDriver.approve(adminId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Fellow driver approved successfully",
      data: {
        fellowDriver: {
          id: fellowDriver._id,
          name: fellowDriver.name,
          approvalStatus: fellowDriver.approvalStatus,
          approvedAt: fellowDriver.approvedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error approving fellow driver:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to approve fellow driver",
    });
  }
};

// Reject fellow driver
const rejectFellowDriver = async (req, res) => {
  try {
    const { fellowDriverId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim() === "") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const fellowDriver = await FellowDriver.findById(fellowDriverId);

    if (!fellowDriver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Fellow driver not found",
      });
    }

    if (fellowDriver.approvalStatus !== "pending") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Fellow driver is not pending approval",
      });
    }

    await fellowDriver.reject(reason, adminId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Fellow driver rejected successfully",
      data: {
        fellowDriver: {
          id: fellowDriver._id,
          name: fellowDriver.name,
          approvalStatus: fellowDriver.approvalStatus,
          rejectionReason: fellowDriver.rejectionReason,
        },
      },
    });
  } catch (error) {
    console.error("Error rejecting fellow driver:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to reject fellow driver",
    });
  }
};

// Update fellow driver approval status
const updateFellowDriverApproval = async (req, res) => {
  try {
    const { fellowDriverId } = req.params;
    const { action, reason } = req.body;
    const adminId = req.user.id;

    if (!["approve", "reject"].includes(action)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'",
      });
    }

    if (action === "reject" && (!reason || reason.trim() === "")) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const fellowDriver = await FellowDriver.findById(fellowDriverId);

    if (!fellowDriver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Fellow driver not found",
      });
    }

    if (fellowDriver.approvalStatus !== "pending") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Fellow driver is not pending approval",
      });
    }

    if (action === "approve") {
      await fellowDriver.approve(adminId);
    } else {
      await fellowDriver.reject(reason, adminId);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Fellow driver ${action}d successfully`,
      data: {
        fellowDriver: {
          id: fellowDriver._id,
          name: fellowDriver.name,
          approvalStatus: fellowDriver.approvalStatus,
          rejectionReason: fellowDriver.rejectionReason,
          approvedAt: fellowDriver.approvedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating fellow driver approval:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update fellow driver approval",
    });
  }
};

module.exports = {
  getAllFellowDrivers,
  getPendingFellowDrivers,
  getFellowDriverDetails,
  approveFellowDriver,
  rejectFellowDriver,
  updateFellowDriverApproval,
};
