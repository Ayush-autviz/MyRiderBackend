const { StatusCodes } = require("http-status-codes");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { 
  getPayFastConfig, 
  generateSignature, 
  validateSignature,
  generatePaymentUrl 
} = require("../config/payfastConfig");
const PayFastTransaction = require("../models/PayFastTransaction");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");

// Create PayFast payment for wallet top-up
const createPayFastPayment = async (req, res) => {
  try {
    const { amount, currency = "ZAR" } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid amount. Amount must be greater than 0",
      });
    }

    // Minimum top-up amount
    if (amount < 5) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Minimum top-up amount is R5",
      });
    }

    // Maximum top-up amount
    if (amount > 50000) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Maximum top-up amount is R50,000",
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate unique payment ID
    const paymentId = uuidv4();

    // Prepare PayFast payment data
    const paymentData = {
      merchant_id: getPayFastConfig().merchantId,
      merchant_key: getPayFastConfig().merchantKey,
      return_url: `${process.env.FRONTEND_URL}/wallet/success`,
      cancel_url: `${process.env.FRONTEND_URL}/wallet/cancel`,
      notify_url: process.env.NODE_ENV === 'production' ? `${process.env.BACKEND_URL}/wallet/payfast/notify` : `https://2ppcf4sc-3000.inc1.devtunnels.ms/wallet/payfast/notify`,
      name_first: user.firstName || 'Customer',
      name_last: user.lastName || '',
      email_address: user.email || '',
      m_payment_id: paymentId,
      amount: amount.toFixed(2),
      item_name: 'Wallet Top-up',
      item_description: `MyRider wallet top-up for ${user.firstName || 'Customer'}`,
      custom_str1: userId.toString(),
      custom_str2: 'wallet_topup',
      custom_str3: currency
    };

    // Generate signature
    const signature = generateSignature(paymentData, getPayFastConfig().passphrase);

    // Save transaction record
    const payFastTransaction = new PayFastTransaction({
      user: userId,
      paymentId: paymentId,
      amount: parseFloat(amount),
      currency,
      status: "created",
      paymentData: paymentData,
      signature: signature,
      itemName: paymentData.item_name,
      itemDescription: paymentData.item_description,
      nameFirst: paymentData.name_first,
      nameLast: paymentData.name_last,
      emailAddress: paymentData.email_address
    });

    await payFastTransaction.save();

    // Generate payment URL
    const paymentUrl = generatePaymentUrl(paymentData);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PayFast payment created successfully",
      data: {
        paymentId: paymentId,
        paymentUrl: paymentUrl,
        amount: amount,
        currency: currency,
      },
    });
  } catch (error) {
    console.error("Error creating PayFast payment:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create PayFast payment",
      error: error.message,
    });
  }
};

// Handle PayFast ITN (Instant Transaction Notification)
const handlePayFastITN = async (req, res) => {
  console.log("PayFast ITN received");
  try {
    const itnData = req.body;

    console.log("ITN Data:", itnData);
    
    // Validate required fields
    if (!itnData.m_payment_id || !itnData.payment_status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid ITN data",
      });
    }

    // Find the transaction record
    const payFastTransaction = await PayFastTransaction.findOne({
      paymentId: itnData.m_payment_id,
    });

    if (!payFastTransaction) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Validate signature
    // const { signature, ...dataToValidate } = itnData;
    // const isValidSignature = validateSignature(
    //   dataToValidate, 
    //   signature, 
    //   getPayFastConfig().passphrase
    // );

    // if (!isValidSignature) {
    //   console.error("Invalid PayFast ITN signature");
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     success: false,
    //     message: "Invalid signature",
    //   });
    // }

    // Update transaction with ITN data
    payFastTransaction.itnData = itnData;
    payFastTransaction.pfPaymentId = itnData.pf_payment_id;

    if (itnData.payment_status === 'COMPLETE') {
      // Payment completed successfully
      if (payFastTransaction.status !== 'complete') {
        payFastTransaction.status = 'complete';
        payFastTransaction.completedAt = new Date();

        // Update user wallet
        const user = await User.findById(payFastTransaction.user);
        if (user) {
          user.walletAmount += payFastTransaction.amount;
          await user.save();

          // Create wallet transaction record
          const walletTransaction = new WalletTransaction({
            user: payFastTransaction.user,
            userType: "customer",
            transactionType: "credit",
            amount: payFastTransaction.amount,
            balanceAfter: user.walletAmount,
            description: `Wallet top-up via PayFast - Payment ${itnData.pf_payment_id}`,
            category: "topup",
            relatedPayment: payFastTransaction._id,
            status: "completed",
          });

          await walletTransaction.save();

          // Update PayFast transaction with wallet transaction reference
          payFastTransaction.walletTransaction = walletTransaction._id;
        }
      }
    } else if (itnData.payment_status === 'CANCELLED') {
      payFastTransaction.status = 'cancelled';
      payFastTransaction.failureReason = 'Payment cancelled by user';
    } else if (itnData.payment_status === 'FAILED') {
      payFastTransaction.status = 'failed';
      payFastTransaction.failureReason = 'Payment failed';
    }

    await payFastTransaction.save();

    // PayFast expects a 200 OK response
    return res.status(StatusCodes.OK).send('OK');

  } catch (error) {
    console.error("Error handling PayFast ITN:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process ITN",
      error: error.message,
    });
  }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const transaction = await PayFastTransaction.findOne({
      paymentId: paymentId,
      user: userId,
    }).populate("walletTransaction");

    if (!transaction) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Transaction status retrieved successfully",
      data: {
        paymentId: transaction.paymentId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        completedAt: transaction.completedAt,
        walletTransaction: transaction.walletTransaction
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message,
    });
  }
};

// Get PayFast transaction details
const getPayFastTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await PayFastTransaction.findOne({
      _id: transactionId,
      user: userId,
    }).populate("walletTransaction");

    if (!transaction) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Transaction retrieved successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching PayFast transaction:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};

// Get user's PayFast transaction history
const getPayFastTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const transactions = await PayFastTransaction.find(query)
      .populate("walletTransaction")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PayFastTransaction.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Transaction history retrieved successfully",
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching PayFast transaction history:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch transaction history",
      error: error.message,
    });
  }
};

module.exports = {
  createPayFastPayment,
  handlePayFastITN,
  checkPaymentStatus,
  getPayFastTransaction,
  getPayFastTransactionHistory,
}; 