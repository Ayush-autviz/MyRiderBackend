const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const Driver = require('../models/Driver');
const WalletTransaction = require('../models/WalletTransaction');
const mongoose = require('mongoose');

// Wallet service class for handling transactions
class WalletService {
  // Credit amount to user wallet
  static async creditUserWallet(userId, amount, description, category, metadata = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const previousBalance = user.walletAmount;
      user.walletAmount += amount;
      await user.save({ session });

      const transaction = new WalletTransaction({
        user: userId,
        userType: 'customer',
        transactionType: 'credit',
        amount,
        balanceAfter: user.walletAmount,
        description,
        category,
        metadata
      });

      await transaction.save({ session });
      await session.commitTransaction();

      return {
        transaction,
        previousBalance,
        newBalance: user.walletAmount
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Debit amount from user wallet
  static async debitUserWallet(userId, amount, description, category, metadata = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.walletAmount < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const previousBalance = user.walletAmount;
      user.walletAmount -= amount;
      await user.save({ session });

      const transaction = new WalletTransaction({
        user: userId,
        userType: 'customer',
        transactionType: 'debit',
        amount,
        balanceAfter: user.walletAmount,
        description,
        category,
        metadata
      });

      await transaction.save({ session });
      await session.commitTransaction();

      return {
        transaction,
        previousBalance,
        newBalance: user.walletAmount
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Credit amount to driver wallet
  static async creditDriverWallet(driverId, amount, description, category, metadata = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const driver = await Driver.findById(driverId).session(session);
      if (!driver) {
        throw new Error('Driver not found');
      }

      const previousBalance = driver.walletAmount;
      driver.walletAmount += amount;
      await driver.save({ session });

      const transaction = new WalletTransaction({
        driver: driverId,
        userType: 'driver',
        transactionType: 'credit',
        amount,
        balanceAfter: driver.walletAmount,
        description,
        category,
        metadata
      });

      await transaction.save({ session });
      await session.commitTransaction();

      return {
        transaction,
        previousBalance,
        newBalance: driver.walletAmount
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Debit amount from driver wallet
  static async debitDriverWallet(driverId, amount, description, category, metadata = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const driver = await Driver.findById(driverId).session(session);
      if (!driver) {
        throw new Error('Driver not found');
      }

      if (driver.walletAmount < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const previousBalance = driver.walletAmount;
      driver.walletAmount -= amount;
      await driver.save({ session });

      const transaction = new WalletTransaction({
        driver: driverId,
        userType: 'driver',
        transactionType: 'debit',
        amount,
        balanceAfter: driver.walletAmount,
        description,
        category,
        metadata
      });

      await transaction.save({ session });
      await session.commitTransaction();

      return {
        transaction,
        previousBalance,
        newBalance: driver.walletAmount
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

// Get user wallet balance and recent transactions
const getUserWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('walletAmount');
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent transactions
    const recentTransactions = await WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('relatedRide', 'pickupLocation destination fare')
      .populate('relatedPayment', 'paymentId amount');

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Wallet information retrieved successfully',
      data: {
        balance: user.walletAmount,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching user wallet:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch wallet information',
      error: error.message
    });
  }
};

// Get user wallet transaction history
const getUserWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, category, transactionType } = req.query;

    const query = { user: userId };
    if (category) query.category = category;
    if (transactionType) query.transactionType = transactionType;

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedRide', 'pickupLocation destination fare status')
      .populate('relatedPayment', 'paymentId amount currency');

    const total = await WalletTransaction.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
};

// Get driver wallet balance and recent transactions
const getDriverWallet = async (req, res) => {
  try {
    const driverId = req.user.id;

    const driver = await Driver.findById(driverId).select('walletAmount');
    if (!driver) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Get recent transactions
    const recentTransactions = await WalletTransaction.find({ driver: driverId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('relatedRide', 'pickupLocation destination fare')
      .populate('relatedWithdrawal', 'amount status');

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Wallet information retrieved successfully',
      data: {
        balance: driver.walletAmount,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching driver wallet:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch wallet information',
      error: error.message
    });
  }
};

// Get driver wallet transaction history
const getDriverWalletTransactions = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { page = 1, limit = 20, category, transactionType } = req.query;

    const query = { driver: driverId };
    if (category) query.category = category;
    if (transactionType) query.transactionType = transactionType;

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedRide', 'pickupLocation destination fare status')
      .populate('relatedWithdrawal', 'amount status bankDetails.accountHolderName');

    const total = await WalletTransaction.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching driver wallet transactions:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
};

module.exports = {
  WalletService,
  getUserWallet,
  getUserWalletTransactions,
  getDriverWallet,
  getDriverWalletTransactions
};
