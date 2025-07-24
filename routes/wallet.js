const express = require('express');
const router = express.Router();

const {
  getUserWallet,
  getUserWalletTransactions
} = require('../controllers/Wallet');

const {
  createPayFastPayment,
  handlePayFastITN,
  checkPaymentStatus,
  getPayFastTransaction,
  getPayFastTransactionHistory
} = require('../controllers/PayFast');

const authUser = require('../middlewares/UserAuthentication');

// ==================== USER WALLET ROUTES ====================
router.get('/balance', authUser, getUserWallet);
router.get('/transactions', authUser, getUserWalletTransactions);

// ==================== PAYFAST ROUTES ====================
router.post('/payfast/create-payment', authUser, createPayFastPayment);
router.post('/payfast/notify', handlePayFastITN); // ITN webhook - no auth required
router.get('/payfast/status/:paymentId', authUser, checkPaymentStatus);
router.get('/payfast/transaction/:transactionId', authUser, getPayFastTransaction);
router.get('/payfast/history', authUser, getPayFastTransactionHistory);

module.exports = router;
