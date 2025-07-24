# PayFast Migration Guide

## Overview

This guide explains the migration from PayPal to PayFast payment gateway in the MyRider backend application.

## Why PayFast?

PayFast is a South African payment gateway that offers:
- **Local Optimization**: Designed specifically for the South African market
- **Multi-Currency Support**: Supports ZAR (primary), USD, EUR, GBP
- **Lower Fees**: Competitive pricing for South African transactions
- **Better Banking Integration**: Direct integration with South African banks
- **Instant Notifications**: Real-time payment updates via ITN webhooks
- **Local Support**: South African customer support and compliance

## Key Changes Made

### 1. Payment Flow Architecture

**PayPal Flow (Old):**
```
Create Order → User Pays → Manual Capture → Wallet Credit
```

**PayFast Flow (New):**
```
Generate Payment URL → User Pays → ITN Webhook → Auto Wallet Credit
```

### 2. Files Changed

#### New Files Created:
- `config/payfastConfig.js` - PayFast configuration and signature generation
- `models/PayFastTransaction.js` - PayFast transaction model
- `controllers/PayFast.js` - PayFast payment controller
- `swagger/payfast.js` - PayFast API documentation
- `docs/PAYFAST_API.md` - Comprehensive PayFast documentation

#### Files Modified:
- `routes/wallet.js` - Updated routes from PayPal to PayFast
- `controllers/Wallet.js` - Updated references from PayPal to PayFast
- `package.json` - Removed PayPal dependencies, added uuid
- `docs/WALLET_API.md` - Updated API documentation

#### Files Removed:
- `config/paypalConfig.js`
- `models/PayPalTransaction.js`
- `controllers/PayPal.js`

### 3. API Endpoints Changes

| PayPal Endpoint | PayFast Endpoint | Purpose |
|-----------------|------------------|---------|
| `POST /wallet/paypal/create-order` | `POST /wallet/payfast/create-payment` | Create payment |
| `POST /wallet/paypal/capture/:orderId` | `GET /wallet/payfast/status/:paymentId` | Check status |
| `GET /wallet/paypal/transaction/:id` | `GET /wallet/payfast/transaction/:id` | Get transaction |
| `GET /wallet/paypal/history` | `GET /wallet/payfast/history` | Transaction history |
| N/A | `POST /wallet/payfast/notify` | ITN webhook |

### 4. Environment Variables

**Remove (PayPal):**
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

**Add (PayFast):**
```env
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
BACKEND_URL=http://localhost:4000
```

### 5. Database Schema Changes

**PayPal Transaction Schema:**
```javascript
{
  paypalOrderId: String,
  paypalPaymentId: String,
  paypalResponse: Object,
  // ...
}
```

**PayFast Transaction Schema:**
```javascript
{
  paymentId: String,        // UUID generated payment ID
  pfPaymentId: String,      // PayFast's payment ID
  signature: String,        // MD5 signature
  paymentData: Object,      // Original payment data
  itnData: Object,          // ITN response data
  // ...
}
```

## Frontend Changes Required

### 1. Payment Initiation

**Old PayPal Implementation:**
```javascript
// Create PayPal order
const response = await fetch('/wallet/paypal/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount: 100, currency: 'USD' })
});

const data = await response.json();
// Redirect to data.data.approvalUrl
```

**New PayFast Implementation:**
```javascript
// Create PayFast payment
const response = await fetch('/wallet/payfast/create-payment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount: 100, currency: 'ZAR' })
});

const data = await response.json();
// Redirect to data.data.paymentUrl
window.location.href = data.data.paymentUrl;
```

### 2. Payment Status Checking

**Old PayPal Implementation:**
```javascript
// Capture payment after user returns
const response = await fetch(`/wallet/paypal/capture/${orderId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**New PayFast Implementation:**
```javascript
// Check payment status after user returns
const response = await fetch(`/wallet/payfast/status/${paymentId}`, {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
// Payment is automatically processed via ITN webhook
```

### 3. Success/Cancel Page Handling

**PayFast Return Handling:**
```javascript
// On return from PayFast
const urlParams = new URLSearchParams(window.location.search);
const paymentId = localStorage.getItem('paymentId');

if (paymentId) {
  const statusResponse = await fetch(`/wallet/payfast/status/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await statusResponse.json();
  
  switch (data.status) {
    case 'complete':
      showSuccess('Payment completed successfully!');
      break;
    case 'failed':
      showError('Payment failed. Please try again.');
      break;
    case 'cancelled':
      showInfo('Payment was cancelled.');
      break;
    default:
      showInfo('Payment is being processed...');
  }
}
```

## Deployment Instructions

### 1. Environment Setup

**Development (.env):**
```env
NODE_ENV=development

# PayFast Sandbox Credentials
PAYFAST_MERCHANT_ID=10004002
PAYFAST_MERCHANT_KEY=q1cd2rdny4a53
PAYFAST_PASSPHRASE=jt7NOE43FZPn

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000

# Other existing variables...
```

**Production (.env.production):**
```env
NODE_ENV=production

# PayFast Live Credentials (obtain from PayFast dashboard)
PAYFAST_MERCHANT_ID=your_live_merchant_id
PAYFAST_MERCHANT_KEY=your_live_merchant_key
PAYFAST_PASSPHRASE=your_live_passphrase

# Production URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Other existing variables...
```

### 2. PayFast Account Setup

1. **Create PayFast Account**:
   - Visit https://www.payfast.co.za
   - Sign up for a merchant account
   - Complete verification process

2. **Configure Sandbox**:
   - Use sandbox credentials for testing
   - Set ITN URL: `https://your-domain.com/wallet/payfast/notify`
   - Configure return URLs

3. **Production Setup**:
   - Obtain live credentials
   - Update ITN URL for production
   - Test with small amounts

### 3. Database Migration

**Optional: Migrate existing PayPal transactions**
```javascript
// Migration script (run once)
const PayPalTransaction = require('./models/PayPalTransaction');
const PayFastTransaction = require('./models/PayFastTransaction');

async function migrateTransactions() {
  const paypalTransactions = await PayPalTransaction.find({});
  
  for (const paypalTx of paypalTransactions) {
    // Create equivalent PayFast transaction for historical purposes
    const payFastTx = new PayFastTransaction({
      user: paypalTx.user,
      paymentId: paypalTx.paypalOrderId, // Use PayPal order ID as payment ID
      amount: paypalTx.amount,
      currency: paypalTx.currency,
      status: paypalTx.status === 'completed' ? 'complete' : paypalTx.status,
      walletTransaction: paypalTx.walletTransaction,
      signature: 'migrated', // Placeholder
      itemName: 'Migrated from PayPal',
      completedAt: paypalTx.completedAt,
      createdAt: paypalTx.createdAt
    });
    
    await payFastTx.save();
  }
}

// Run migration
migrateTransactions().then(() => {
  console.log('Migration completed');
});
```

### 4. Testing Checklist

**Pre-deployment:**
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] PayFast sandbox account setup
- [ ] ITN webhook URL configured
- [ ] Test payment flow works
- [ ] Wallet crediting works correctly
- [ ] Error handling tested

**Post-deployment:**
- [ ] Production environment configured
- [ ] Live PayFast credentials added
- [ ] ITN webhook updated to production URL
- [ ] Small test payment successful
- [ ] Monitoring and logs working

### 5. Rollback Plan

If issues occur, you can temporarily restore PayPal:

1. **Quick Rollback**:
   ```bash
   git checkout previous-paypal-commit
   npm install @paypal/checkout-server-sdk paypal-rest-sdk
   # Update environment variables back to PayPal
   ```

2. **Gradual Migration**:
   - Keep both PayPal and PayFast active
   - Route new transactions to PayFast
   - Gradually phase out PayPal

## Monitoring and Alerts

### 1. PayFast Webhook Monitoring
```javascript
// Add to your monitoring system
app.post('/wallet/payfast/notify', (req, res, next) => {
  console.log('PayFast ITN received:', {
    timestamp: new Date(),
    paymentId: req.body.m_payment_id,
    status: req.body.payment_status,
    amount: req.body.amount_gross
  });
  
  next();
});
```

### 2. Failed Payment Alerts
```javascript
// In PayFast controller
if (itnData.payment_status === 'FAILED') {
  // Send alert to monitoring system
  console.error('PayFast payment failed:', {
    paymentId: itnData.m_payment_id,
    userId: payFastTransaction.user,
    amount: payFastTransaction.amount
  });
}
```

## Support and Documentation

### PayFast Resources:
- **Developer Documentation**: https://developers.payfast.co.za/
- **Support Email**: support@payfast.co.za
- **Status Page**: https://status.payfast.co.za/

### Internal Documentation:
- **API Documentation**: `/docs/PAYFAST_API.md`
- **Swagger UI**: `http://localhost:4000/api-docs`
- **Testing Guide**: Included in PAYFAST_API.md

## Troubleshooting

### Common Issues:

1. **Invalid Signature Errors**
   ```
   Solution: Check passphrase configuration and parameter order
   ```

2. **ITN Not Received**
   ```
   Solution: Verify webhook URL is accessible and uses HTTPS in production
   ```

3. **Payment Status Not Updating**
   ```
   Solution: Check ITN endpoint logs and signature validation
   ```

4. **Currency Conversion Issues**
   ```
   Solution: Ensure proper currency handling in frontend and backend
   ```

For additional support, check the comprehensive API documentation in `/docs/PAYFAST_API.md`. 