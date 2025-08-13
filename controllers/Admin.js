const Admin = require("../models/Admin");
const User = require("../models/User");
const Driver = require("../models/Driver");
const Ride = require("../models/Ride");
const Vehicle = require("../models/Vehicle");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==================== AUTHENTICATION ====================

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!admin.isActive) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password (assuming you'll hash passwords)
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate tokens
    const accessToken = admin.createAccessToken();
    const refreshToken = admin.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
          profileImage: admin.profileImage,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    if (payload.type !== 'admin') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid token type",
      });
    }

    const admin = await Admin.findById(payload.id);

    if (!admin || !admin.isActive) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = admin.createAccessToken();
    const newRefreshToken = admin.createRefreshToken();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
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

// ==================== DASHBOARD STATISTICS ====================

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalDrivers,
      totalRides,
      activeRides,
      totalRevenue,
      thisMonthUsers,
      lastMonthUsers,
      thisMonthDrivers,
      lastMonthDrivers,
      thisMonthRides,
      lastMonthRides,
      thisMonthRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Driver.countDocuments(),
      Ride.countDocuments(),
      Ride.countDocuments({ 
        status: { $in: ['accepted', 'arrived', 'otp_verified', 'in_progress'] } 
      }),
      Ride.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fare' } } }
      ]),
      // This month counts
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      Driver.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Driver.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      Ride.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Ride.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      Ride.aggregate([
        { 
          $match: { 
            status: 'completed', 
            createdAt: { $gte: startOfThisMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$fare' } } }
      ]),
      Ride.aggregate([
        { 
          $match: { 
            status: 'completed', 
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$fare' } } }
      ])
    ]);

    // Calculate growth rates
    const userGrowth = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : '0';
    
    const driverGrowth = lastMonthDrivers > 0 
      ? ((thisMonthDrivers - lastMonthDrivers) / lastMonthDrivers * 100).toFixed(1)
      : '0';
    
    const rideGrowth = lastMonthRides > 0 
      ? ((thisMonthRides - lastMonthRides) / lastMonthRides * 100).toFixed(1)
      : '0';

    const currentRevenue = thisMonthRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : '0';

    const overallGrowth = ((parseFloat(userGrowth) + parseFloat(driverGrowth) + parseFloat(rideGrowth)) / 3).toFixed(1);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        totalUsers,
        totalDrivers,
        totalRides,
        activeRides,
        revenue: totalRevenue[0]?.total || 0,
        growthRate: parseFloat(overallGrowth),
        trends: {
          users: {
            current: thisMonthUsers,
            previous: lastMonthUsers,
            growth: parseFloat(userGrowth)
          },
          drivers: {
            current: thisMonthDrivers,
            previous: lastMonthDrivers,
            growth: parseFloat(driverGrowth)
          },
          rides: {
            current: thisMonthRides,
            previous: lastMonthRides,
            growth: parseFloat(rideGrowth)
          },
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            growth: parseFloat(revenueGrowth)
          }
        }
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
    });
  }
};

// ==================== RECENT ACTIVITY ====================

const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit);

    // Get recent activities from different collections
    const [
      recentUsers,
      recentDrivers,
      recentRides,
      recentDriverApprovals,
      recentRideCancellations
    ] = await Promise.all([
      // Recent user registrations
      User.find({})
        .select('firstName lastName createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent driver registrations
      Driver.find({})
        .select('firstName lastName createdAt accountStatus')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent rides
      Ride.find({})
        .populate('customer', 'firstName lastName')
        .populate('driver', 'firstName lastName')
        .select('customer driver status createdAt updatedAt fare')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),

      // Recent driver approvals
      Driver.find({ 
        accountStatus: { $in: ['active', 'rejected'] },
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
        .select('firstName lastName accountStatus updatedAt')
        .sort({ updatedAt: -1 })
        .limit(3)
        .lean(),

      // Recent ride cancellations
      Ride.find({ 
        status: 'cancelled',
        cancelledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
        .populate('customer', 'firstName lastName')
        .select('customer cancellationReason cancelledBy cancelledAt')
        .sort({ cancelledAt: -1 })
        .limit(3)
        .lean()
    ]);

    // Combine and format activities
    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id}`,
        type: 'user_registration',
        title: 'New user registered',
        description: `${user.firstName} ${user.lastName} joined the platform`,
        timestamp: user.createdAt,
        metadata: {
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`
        }
      });
    });

    // Add driver registrations
    recentDrivers.forEach(driver => {
      activities.push({
        id: `driver_reg_${driver._id}`,
        type: 'driver_registration',
        title: 'New driver application',
        description: `${driver.firstName} ${driver.lastName} applied to become a driver`,
        timestamp: driver.createdAt,
        metadata: {
          driverId: driver._id,
          driverName: `${driver.firstName} ${driver.lastName}`,
          status: driver.accountStatus
        }
      });
    });

    // Add driver approvals/rejections
    recentDriverApprovals.forEach(driver => {
      const isApproved = driver.accountStatus === 'active';
      activities.push({
        id: `driver_approval_${driver._id}`,
        type: isApproved ? 'driver_approved' : 'driver_rejected',
        title: isApproved ? 'Driver approved' : 'Driver rejected',
        description: `${driver.firstName} ${driver.lastName} application ${isApproved ? 'approved' : 'rejected'}`,
        timestamp: driver.updatedAt,
        metadata: {
          driverId: driver._id,
          driverName: `${driver.firstName} ${driver.lastName}`,
          status: driver.accountStatus
        }
      });
    });

    // Add ride activities
    recentRides.forEach(ride => {
      const customerName = ride.customer ? `${ride.customer.firstName} ${ride.customer.lastName}` : 'Unknown Customer';
      const driverName = ride.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : 'No driver assigned';
      
      let title, description;
      
      switch (ride.status) {
        case 'completed':
          title = 'Ride completed';
          description = `${customerName} completed ride with ${driverName}`;
          break;
        case 'cancelled':
          title = 'Ride cancelled';
          description = `Ride between ${customerName} and ${driverName} was cancelled`;
          break;
        case 'in_progress':
          title = 'Ride in progress';
          description = `${customerName} is riding with ${driverName}`;
          break;
        case 'accepted':
          title = 'Ride accepted';
          description = `${driverName} accepted ride request from ${customerName}`;
          break;
        default:
          title = 'New ride requested';
          description = `${customerName} requested a ride`;
      }

      activities.push({
        id: `ride_${ride._id}`,
        type: 'ride_activity',
        title,
        description,
        timestamp: ride.status === 'completed' ? ride.updatedAt : ride.createdAt,
        metadata: {
          rideId: ride._id,
          customerId: ride.customer?._id,
          driverId: ride.driver?._id,
          status: ride.status,
          fare: ride.fare
        }
      });
    });

    // Add ride cancellations
    recentRideCancellations.forEach(ride => {
      const customerName = ride.customer ? `${ride.customer.firstName} ${ride.customer.lastName}` : 'Unknown Customer';
      
      activities.push({
        id: `cancellation_${ride._id}`,
        type: 'ride_cancelled',
        title: 'Ride cancelled',
        description: `${customerName}'s ride was cancelled by ${ride.cancelledBy}`,
        timestamp: ride.cancelledAt,
        metadata: {
          rideId: ride._id,
          customerId: ride.customer?._id,
          reason: ride.cancellationReason,
          cancelledBy: ride.cancelledBy
        }
      });
    });

    // Sort by timestamp (most recent first) and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limitNum);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Recent activity retrieved successfully",
      data: {
        activities: sortedActivities,
        total: sortedActivities.length
      },
    });
  } catch (error) {
    console.error("Recent activity error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve recent activity",
    });
  }
};

// ==================== USER MANAGEMENT ====================

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.profileStatus = parseInt(status);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-otp -otpExpires')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limitNum);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

// Get User Details
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-otp -otpExpires');

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's ride history
    const rides = await Ride.find({ customer: userId })
      .populate('driver', 'firstName lastName phone averageRating')
      .populate('vehicle', 'type pricePerKm')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User details retrieved successfully",
      data: {
        user,
        recentRides: rides,
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve user details",
    });
  }
};

// Update User Status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (![1, 2].includes(parseInt(status))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid status. Must be 1 (active) or 2 (suspended)",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profileStatus: parseInt(status) },
      { new: true }
    ).select('-otp -otpExpires');

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User status updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// Update User Profile (Admin only)
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email } = req.body;

    if (!firstName && !lastName && !email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "At least one field (firstName, lastName, email) is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;

    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User profile updated successfully",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profileStatus: user.profileStatus,
          walletAmount: user.walletAmount,
          registrationComplete: user.registrationComplete,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update user profile",
    });
  }
};

// Get User Rides
const getUserRides = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { customer: userId };

    if (status) {
      query.status = status;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [rides, totalRides] = await Promise.all([
      Ride.find(query)
        .populate('driver', 'firstName lastName phone')
        .populate('vehicle', 'type pricePerKm')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Ride.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalRides / limitNum);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User rides retrieved successfully",
      data: {
        rides,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRides,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user rides error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve user rides",
    });
  }
};

// ==================== DRIVER MANAGEMENT ====================

// Get All Drivers
const getAllDrivers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      vehicleType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.accountStatus = status;
    }

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [drivers, totalDrivers] = await Promise.all([
      Driver.find(query)
        .select('-otp -otpExpires')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Driver.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalDrivers / limitNum);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Drivers retrieved successfully",
      data: {
        drivers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDrivers,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all drivers error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve drivers",
    });
  }
};

// Get Driver Details
const getDriverDetails = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId).select('-otp -otpExpires');

    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Get driver's ride history
    const rides = await Ride.find({ driver: driverId })
      .populate('customer', 'firstName lastName phone')
      .populate('vehicle', 'type pricePerKm')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver details retrieved successfully",
      data: {
        driver,
        recentRides: rides,
      },
    });
  } catch (error) {
    console.error("Get driver details error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve driver details",
    });
  }
};

// Approve/Reject Driver
const updateDriverApproval = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { action, reason = '' } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid action. Must be 'approve' or 'reject'",
      });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (driver.accountStatus !== 'ApprovalPending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Driver is not pending approval",
      });
    }

    // Update driver status
    const newStatus = action === 'approve' ? 'active' : 'rejected';
    driver.accountStatus = newStatus;

    if (action === 'approve') {
      driver.isVerified = true;
    }

    // You can add rejection reason to driver model if needed
    if (action === 'reject' && reason) {
      driver.rejectionReason = reason;
    }

    await driver.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Driver ${action}d successfully`,
      data: {
        driver: {
          id: driver._id,
          accountStatus: driver.accountStatus,
          isVerified: driver.isVerified
        }
      },
    });
  } catch (error) {
    console.error("Update driver approval error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update driver approval",
    });
  }
};

// Update Driver Status
const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body; // 'active', 'suspended', 'rejected'

    const validStatuses = ['active', 'suspended', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { accountStatus: status },
      { new: true }
    ).select('-otp -otpExpires');

    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver status updated successfully",
      data: { driver },
    });
  } catch (error) {
    console.error("Update driver status error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update driver status",
    });
  }
};

// Get Driver Rides
const getDriverRides = async (req, res) => {
  try {
    const { driverId } = req.params;
    const {
      page = 1,
      limit = 10,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { driver: driverId };

    if (status) {
      query.status = status;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [rides, totalRides] = await Promise.all([
      Ride.find(query)
        .populate('customer', 'firstName lastName phone')
        .populate('vehicle', 'type pricePerKm')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Ride.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalRides / limitNum);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver rides retrieved successfully",
      data: {
        rides,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRides,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get driver rides error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve driver rides",
    });
  }
};

// ==================== RIDE MANAGEMENT ====================

// Get All Rides
const getAllRides = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      search = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [rides, totalRides] = await Promise.all([
      Ride.find(query)
        .populate('customer', 'firstName lastName phone')
        .populate('driver', 'firstName lastName phone averageRating')
        .populate('vehicle', 'type pricePerKm')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Ride.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalRides / limitNum);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Rides retrieved successfully",
      data: {
        rides,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRides,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all rides error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve rides",
    });
  }
};

// Get Ride Details
const getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId)
      .populate('customer', 'firstName lastName phone email profileImage')
      .populate('driver', 'firstName lastName phone email averageRating totalRides vehicleDetails')
      .populate('vehicle', 'type pricePerKm description');

    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Ride not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Ride details retrieved successfully",
      data: { ride },
    });
  } catch (error) {
    console.error("Get ride details error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve ride details",
    });
  }
};

// Cancel Ride (Admin Override)
const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason = 'Cancelled by admin' } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Cannot cancel a completed or already cancelled ride",
      });
    }

    ride.status = 'cancelled';
    ride.cancellationReason = reason;
    ride.cancelledBy = 'admin';
    ride.cancelledAt = new Date();

    await ride.save();

    // If driver was assigned, make them available again
    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, {
        currentRide: null,
        isAvailable: true
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Ride cancelled successfully",
      data: { ride },
    });
  } catch (error) {
    console.error("Cancel ride error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to cancel ride",
    });
  }
};

// ==================== ANALYTICS ====================

// Get Analytics Data
const getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const [
      rideStats,
      revenueStats,
      userGrowth,
      driverGrowth,
      ridesByStatus,
      topDrivers
    ] = await Promise.all([
      // Ride statistics
      Ride.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            totalRides: { $sum: 1 },
            completedRides: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledRides: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            averageRating: { $avg: '$rating' },
            totalDistance: { $sum: '$distance' },
            totalDuration: { $sum: '$duration' }
          }
        }
      ]),

      // Revenue statistics
      Ride.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$fare' },
            averageFare: { $avg: '$fare' },
            totalRides: { $sum: 1 }
          }
        }
      ]),

      // User growth
      User.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Driver growth
      Driver.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Rides by status
      Ride.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Top performing drivers
      Driver.aggregate([
        { $match: { totalRides: { $gt: 0 } } },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            phone: 1,
            totalRides: 1,
            averageRating: 1,
            accountStatus: 1
          }
        },
        { $sort: { totalRides: -1, averageRating: -1 } },
        { $limit: 10 }
      ])
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Analytics data retrieved successfully",
      data: {
        period,
        rides: rideStats[0] || {},
        revenue: revenueStats[0] || {},
        userGrowth,
        driverGrowth,
        ridesByStatus,
        topDrivers,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve analytics data",
    });
  }
};

// ==================== VEHICLE MANAGEMENT ====================

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ type: 1 });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: {
        vehicles,
        count: vehicles.length,
      },
    });
  } catch (error) {
    console.error("Get all vehicles error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve vehicles",
    });
  }
};

// Get vehicle details
const getVehicleDetails = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Vehicle details retrieved successfully",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    console.error("Get vehicle details error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve vehicle details",
    });
  }
};

// Update vehicle price
const updateVehiclePrice = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { pricePerKm } = req.body;

    if (!pricePerKm || pricePerKm < 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Valid price per km is required",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Store old price for logging
    const oldPrice = vehicle.pricePerKm;

    // Update the price
    vehicle.pricePerKm = pricePerKm;
    await vehicle.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Vehicle price updated successfully",
      data: {
        vehicle: {
          id: vehicle._id,
          type: vehicle.type,
          pricePerKm: vehicle.pricePerKm,
          description: vehicle.description,
          updatedAt: vehicle.updatedAt,
        },
        change: {
          oldPrice,
          newPrice: vehicle.pricePerKm,
          difference: vehicle.pricePerKm - oldPrice,
        },
      },
    });
  } catch (error) {
    console.error("Update vehicle price error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update vehicle price",
    });
  }
};

module.exports = {
  adminLogin,
  refreshToken,
  getDashboardStats,
  getRecentActivity,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserProfile,
  getUserRides,
  getAllDrivers,
  getDriverDetails,
  updateDriverApproval,
  updateDriverStatus,
  getDriverRides,
  getAllRides,
  getRideDetails,
  cancelRide,
  getAnalytics,
  getAllVehicles,
  getVehicleDetails,
  updateVehiclePrice,
};
