const express = require('express');
const router = express.Router();

const {
  getUserWallet,
  getUserWalletTransactions
} = require('../controllers/Wallet');

const {
  createPayPalOrder,
  capturePayPalPayment,
  getPayPalTransaction,
  getPayPalTransactionHistory
} = require('../controllers/PayPal');

const authUser = require('../middlewares/UserAuthentication');

// ==================== USER WALLET ROUTES ====================
router.get('/balance', authUser, getUserWallet);
router.get('/transactions', authUser, getUserWalletTransactions);

// ==================== PAYPAL ROUTES ====================
router.post('/paypal/create-order', authUser, createPayPalOrder);
router.post('/paypal/capture/:orderId', authUser, capturePayPalPayment);
router.get('/paypal/transaction/:transactionId', authUser, getPayPalTransaction);
router.get('/paypal/history', authUser, getPayPalTransactionHistory);

module.exports = router;
