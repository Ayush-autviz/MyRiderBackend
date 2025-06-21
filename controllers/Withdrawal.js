const { StatusCodes } = require('http-status-codes');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Driver = require('../models/Driver');
const { WalletService } = require('./Wallet');

// Create withdrawal request (Driver)
const createWithdrawalRequest = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { amount, bankDetails } = req.body;

    // Validate required fields
    if (!amount || !bankDetails) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Amount and bank details are required'
      });
    }

    // Validate bank details
    const { accountHolderName, accountNumber, bankName } = bankDetails;
    if (!accountHolderName || !accountNumber || !bankName) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Account holder name, account number, and bank name are required'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Minimum withdrawal amount
    if (amount < 10) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Minimum withdrawal amount is $10'
      });
    }

    // Check driver wallet balance
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (driver.walletAmount < amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Insufficient wallet balance. Available: $${driver.walletAmount}, Requested: $${amount}`
      });
    }

    // Check for pending withdrawal requests
    const pendingRequest = await WithdrawalRequest.findOne({
      driver: driverId,
      status: 'pending'
    });

    if (pendingRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'You already have a pending withdrawal request'
      });
    }

    // Create withdrawal request
    const withdrawalRequest = new WithdrawalRequest({
      driver: driverId,
      amount,
      requestedAmount: amount,
      bankDetails
    });

    await withdrawalRequest.save();

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawalRequest
    });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create withdrawal request',
      error: error.message
    });
  }
};

// Get driver's withdrawal requests
const getDriverWithdrawalRequests = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { driver: driverId };
    if (status) {
      query.status = status;
    }

    const requests = await WithdrawalRequest.find(query)
      .populate('processedBy', 'firstName lastName username')
      .populate('walletTransaction')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WithdrawalRequest.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Withdrawal requests retrieved successfully',
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRequests: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch withdrawal requests',
      error: error.message
    });
  }
};

// Get withdrawal request by ID (Driver)
const getWithdrawalRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const driverId = req.user.id;

    const request = await WithdrawalRequest.findOne({
      _id: requestId,
      driver: driverId
    })
      .populate('processedBy', 'firstName lastName username')
      .populate('walletTransaction');

    if (!request) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Withdrawal request retrieved successfully',
      data: request
    });

  } catch (error) {
    console.error('Error fetching withdrawal request:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch withdrawal request',
      error: error.message
    });
  }
};

// Cancel withdrawal request (Driver)
const cancelWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const driverId = req.user.id;

    const request = await WithdrawalRequest.findOne({
      _id: requestId,
      driver: driverId,
      status: 'pending'
    });

    if (!request) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Pending withdrawal request not found'
      });
    }

    request.status = 'rejected';
    request.rejectionReason = 'Cancelled by driver';
    await request.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Withdrawal request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling withdrawal request:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to cancel withdrawal request',
      error: error.message
    });
  }
};

// Get all withdrawal requests (Admin)
const getAllWithdrawalRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, driverId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (driverId) query.driver = driverId;

    const requests = await WithdrawalRequest.find(query)
      .populate('driver', 'firstName lastName phone email walletAmount')
      .populate('processedBy', 'firstName lastName username')
      .populate('walletTransaction')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WithdrawalRequest.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Withdrawal requests retrieved successfully',
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRequests: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch withdrawal requests',
      error: error.message
    });
  }
};

// Approve withdrawal request (Admin)
const approveWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes, transactionId } = req.body;
    const adminId = req.admin.id;

    const request = await WithdrawalRequest.findOne({
      _id: requestId,
      status: 'pending'
    }).populate('driver');

    if (!request) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Pending withdrawal request not found'
      });
    }

    // Check if driver still has sufficient balance
    if (request.driver.walletAmount < request.amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Driver has insufficient wallet balance'
      });
    }

    // Deduct amount from driver wallet
    const walletResult = await WalletService.debitDriverWallet(
      request.driver._id,
      request.amount,
      `Withdrawal request approved - ${request._id}`,
      'withdrawal',
      {
        withdrawalRequestId: request._id,
        adminId: adminId
      }
    );

    // Update withdrawal request
    request.status = 'approved';
    request.adminNotes = adminNotes;
    request.transactionId = transactionId;
    request.processedBy = adminId;
    request.processedAt = new Date();
    request.walletTransaction = walletResult.transaction._id;
    await request.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Withdrawal request approved successfully',
      data: {
        request,
        driverNewBalance: walletResult.newBalance
      }
    });

  } catch (error) {
    console.error('Error approving withdrawal request:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to approve withdrawal request',
      error: error.message
    });
  }
};

// Reject withdrawal request (Admin)
const rejectWithdrawalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const adminId = req.admin.id;

    if (!rejectionReason) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const request = await WithdrawalRequest.findOne({
      _id: requestId,
      status: 'pending'
    });

    if (!request) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Pending withdrawal request not found'
      });
    }

    // Update withdrawal request
    request.status = 'rejected';
    request.rejectionReason = rejectionReason;
    request.adminNotes = adminNotes;
    request.processedBy = adminId;
    request.processedAt = new Date();
    await request.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Withdrawal request rejected successfully',
      data: request
    });

  } catch (error) {
    console.error('Error rejecting withdrawal request:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reject withdrawal request',
      error: error.message
    });
  }
};

module.exports = {
  createWithdrawalRequest,
  getDriverWithdrawalRequests,
  getWithdrawalRequestById,
  cancelWithdrawalRequest,
  getAllWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest
};
