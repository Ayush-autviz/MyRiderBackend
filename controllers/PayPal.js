const { StatusCodes } = require("http-status-codes");
const paypal = require("@paypal/checkout-server-sdk");
const { client } = require("../config/paypalConfig");
const PayPalTransaction = require("../models/PayPalTransaction");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");

// Create PayPal order for wallet top-up
const createPayPalOrder = async (req, res) => {
  try {
    const { amount, currency = "USD" } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid amount. Amount must be greater than 0",
      });
    }

    // Minimum top-up amount
    if (amount < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Minimum top-up amount is $1",
      });
    }

    // Maximum top-up amount
    if (amount > 1000) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Maximum top-up amount is $1000",
      });
    }

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: `Wallet top-up for user ${userId}`,
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/wallet/success`,
        cancel_url: `${process.env.FRONTEND_URL}/wallet/cancel`,
        brand_name: "MyRider",
        user_action: "PAY_NOW",
      },
    });

    // Execute PayPal request
    const order = await client().execute(request);

    // Save transaction record
    const paypalTransaction = new PayPalTransaction({
      user: userId,
      paypalOrderId: order.result.id,
      amount: parseFloat(amount),
      currency,
      status: "created",
      paypalResponse: order.result,
    });

    await paypalTransaction.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PayPal order created successfully",
      data: {
        orderId: order.result.id,
        approvalUrl: order.result.links.find((link) => link.rel === "approve")
          .href,
        amount: amount,
        currency: currency,
      },
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create PayPal order",
      error: error.message,
    });
  }
};

// Capture PayPal payment
const capturePayPalPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find the transaction record
    const paypalTransaction = await PayPalTransaction.findOne({
      paypalOrderId: orderId,
      user: userId,
    });

    if (!paypalTransaction) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (paypalTransaction.status === "completed") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Transaction already completed",
      });
    }

    // Capture the payment
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client().execute(request);

    if (capture.result.status === "COMPLETED") {
      // Update PayPal transaction
      paypalTransaction.status = "completed";
      paypalTransaction.paypalPaymentId =
        capture.result.purchase_units[0].payments.captures[0].id;
      paypalTransaction.paypalResponse = capture.result;
      paypalTransaction.completedAt = new Date();
      await paypalTransaction.save();

      // Update user wallet
      const user = await User.findById(userId);
      const previousBalance = user.walletAmount;
      user.walletAmount += paypalTransaction.amount;
      await user.save();

      // Create wallet transaction record
      const walletTransaction = new WalletTransaction({
        user: userId,
        userType: "customer",
        transactionType: "credit",
        amount: paypalTransaction.amount,
        balanceAfter: user.walletAmount,
        description: `Wallet top-up via PayPal - Order ${orderId}`,
        category: "topup",
        relatedPayment: paypalTransaction._id,
        status: "completed",
      });

      await walletTransaction.save();

      // Update PayPal transaction with wallet transaction reference
      paypalTransaction.walletTransaction = walletTransaction._id;
      await paypalTransaction.save();

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Payment captured successfully",
        data: {
          transactionId: walletTransaction._id,
          amount: paypalTransaction.amount,
          newBalance: user.walletAmount,
          paypalPaymentId: paypalTransaction.paypalPaymentId,
        },
      });
    } else {
      // Payment failed
      paypalTransaction.status = "failed";
      paypalTransaction.failureReason = "Payment capture failed";
      paypalTransaction.paypalResponse = capture.result;
      await paypalTransaction.save();

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Payment capture failed",
        data: {
          status: capture.result.status,
        },
      });
    }
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);

    // Update transaction status to failed
    try {
      await PayPalTransaction.findOneAndUpdate(
        { paypalOrderId: req.params.orderId, user: req.user.id },
        {
          status: "failed",
          failureReason: error.message,
          paypalResponse: error.details || {},
        }
      );
    } catch (updateError) {
      console.error("Error updating failed transaction:", updateError);
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to capture payment",
      error: error.message,
    });
  }
};

// Get PayPal transaction details
const getPayPalTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await PayPalTransaction.findOne({
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
    console.error("Error fetching PayPal transaction:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};

// Get user's PayPal transaction history
const getPayPalTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const transactions = await PayPalTransaction.find(query)
      .populate("walletTransaction")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PayPalTransaction.countDocuments(query);

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
    console.error("Error fetching PayPal transaction history:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch transaction history",
      error: error.message,
    });
  }
};

module.exports = {
  createPayPalOrder,
  capturePayPalPayment,
  getPayPalTransaction,
  getPayPalTransactionHistory,
};
