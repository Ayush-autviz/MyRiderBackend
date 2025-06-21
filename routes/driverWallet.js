const express = require('express');
const router = express.Router();

const {
  getDriverWallet,
  getDriverWalletTransactions
} = require('../controllers/Wallet');

const {
  createWithdrawalRequest,
  getDriverWithdrawalRequests,
  getWithdrawalRequestById,
  cancelWithdrawalRequest
} = require('../controllers/Withdrawal');

const authDriver = require('../middlewares/DriverAuthentication');

// ==================== DRIVER WALLET ROUTES ====================
router.get('/balance', authDriver, getDriverWallet);
router.get('/transactions', authDriver, getDriverWalletTransactions);

// ==================== WITHDRAWAL ROUTES ====================
router.post('/withdrawal/request', authDriver, createWithdrawalRequest);
router.get('/withdrawal/requests', authDriver, getDriverWithdrawalRequests);
router.get('/withdrawal/request/:requestId', authDriver, getWithdrawalRequestById);
router.put('/withdrawal/request/:requestId/cancel', authDriver, cancelWithdrawalRequest);

module.exports = router;
