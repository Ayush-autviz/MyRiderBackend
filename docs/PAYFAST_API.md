# PayFast Payment Gateway API Documentation

This document provides comprehensive documentation for the PayFast payment gateway integration in the Rider Backend application.

## Table of Contents

1. [Overview](#overview)
2. [PayFast Integration Setup](#payfast-integration-setup)
3. [Payment Flow](#payment-flow)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Environment Configuration](#environment-configuration)
7. [Testing Guide](#testing-guide)

## Overview

PayFast is a South African payment gateway that allows merchants to accept payments online securely. Our integration supports:
- Wallet top-up via PayFast
- Real-time payment notifications (ITN)
- Multi-currency support (ZAR, USD, EUR, GBP)
- Secure signature validation
- Sandbox and production environments

## PayFast Integration Setup

### 1. PayFast Account Requirements
- PayFast merchant account (create at https://www.payfast.co.za)
- Merchant ID and Merchant Key from PayFast dashboard
- Passphrase for signature generation

### 2. Environment Variables
Add the following variables to your `.env` file:

```env
# PayFast Configuration
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

## Payment Flow

### New PayFast Payment Flow

1. **Payment Initiation**
   - User requests wallet top-up
   - Backend creates payment record
   - PayFast payment URL is generated with signature
   - User is redirected to PayFast payment page

2. **Payment Processing**
   - User completes payment on PayFast
   - PayFast sends ITN (Instant Transaction Notification) to webhook
   - Backend validates signature and updates payment status
   - User wallet is credited upon successful payment

3. **Payment Completion**
   - User is redirected to success/cancel page
   - Frontend can check payment status via API
   - Wallet balance is updated in real-time

### Comparison with Previous PayPal Flow

| Aspect | PayPal | PayFast |
|--------|--------|---------|
| **Integration Method** | SDK-based with order creation/capture | Direct URL generation with ITN webhooks |
| **Payment Process** | 1. Create order → 2. User pays → 3. Capture payment | 1. Generate payment URL → 2. User pays → 3. ITN webhook |
| **Currency** | USD, EUR, GBP, CAD, AUD | ZAR (primary), USD, EUR, GBP |
| **Region Focus** | Global | South Africa focused |
| **Webhook System** | Manual capture required | Automatic ITN (Instant Transaction Notification) |
| **Security** | OAuth + Client credentials | MD5 signature validation |

## API Endpoints

### Create PayFast Payment
**POST** `/wallet/payfast/create-payment`

Create a new PayFast payment for wallet top-up.

**Headers:**
```
Authorization: Bearer <user_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "ZAR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PayFast payment created successfully",
  "data": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "paymentUrl": "https://sandbox.payfast.co.za/eng/process?merchant_id=...",
    "amount": 100.00,
    "currency": "ZAR"
  }
}
```

### Check Payment Status
**GET** `/wallet/payfast/status/{paymentId}`

Check the current status of a PayFast payment.

**Headers:**
```
Authorization: Bearer <user_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction status retrieved successfully",
  "data": {
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "complete",
    "amount": 100.00,
    "currency": "ZAR",
    "completedAt": "2024-01-15T14:30:00Z",
    "walletTransaction": {
      "_id": "wallet_transaction_id",
      "amount": 100.00,
      "balanceAfter": 250.00
    }
  }
}
```

### ITN Webhook (Internal)
**POST** `/wallet/payfast/notify`

This endpoint receives payment notifications from PayFast. No authentication required.

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Request Body:** (sent by PayFast)
```
m_payment_id=550e8400-e29b-41d4-a716-446655440000
pf_payment_id=1234567
payment_status=COMPLETE
amount_gross=100.00
amount_fee=2.30
amount_net=97.70
signature=generated_md5_hash
```

### Get Transaction History
**GET** `/wallet/payfast/history`

Get paginated PayFast transaction history.

**Headers:**
```
Authorization: Bearer <user_access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (created, complete, failed, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Transaction history retrieved successfully",
  "data": {
    "transactions": [
      {
        "_id": "transaction_id",
        "paymentId": "550e8400-e29b-41d4-a716-446655440000",
        "amount": 100.00,
        "status": "complete",
        "currency": "ZAR",
        "completedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTransactions": 48,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Frontend Integration

### React/JavaScript Integration

```javascript
// 1. Create PayFast payment
const createPayment = async (amount) => {
  try {
    const response = await fetch('/wallet/payfast/create-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'ZAR'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Redirect user to PayFast payment page
      window.location.href = data.data.paymentUrl;
      
      // Or open in a new window/popup
      // window.open(data.data.paymentUrl, '_blank');
      
      return data.data.paymentId;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw error;
  }
};

// 2. Check payment status (call this when user returns from PayFast)
const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await fetch(`/wallet/payfast/status/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
};

// 3. Handle return from PayFast (on success/cancel pages)
const handlePaymentReturn = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentId = urlParams.get('paymentId') || localStorage.getItem('paymentId');
  
  if (paymentId) {
    const status = await checkPaymentStatus(paymentId);
    
    if (status.data.status === 'complete') {
      // Payment successful
      alert('Payment successful! Your wallet has been credited.');
      // Redirect to wallet page or update UI
    } else if (status.data.status === 'failed') {
      // Payment failed
      alert('Payment failed. Please try again.');
    } else {
      // Payment still pending
      alert('Payment is being processed. Please wait.');
    }
    
    localStorage.removeItem('paymentId');
  }
};
```

### Payment Flow Implementation

```javascript
// Complete payment flow example
class PayFastPayment {
  constructor(userToken) {
    this.userToken = userToken;
  }

  async initiatePayment(amount, currency = 'ZAR') {
    try {
      // Store payment intent for later reference
      localStorage.setItem('paymentAmount', amount);
      
      const response = await fetch('/wallet/payfast/create-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store payment ID for status checking
        localStorage.setItem('paymentId', data.data.paymentId);
        
        // Redirect to PayFast
        window.location.href = data.data.paymentUrl;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment: ' + error.message);
    }
  }

  async handlePaymentReturn() {
    const paymentId = localStorage.getItem('paymentId');
    const amount = localStorage.getItem('paymentAmount');
    
    if (!paymentId) return;

    try {
      const response = await fetch(`/wallet/payfast/status/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        const status = data.data.status;
        
        switch (status) {
          case 'complete':
            alert(`Payment of R${amount} completed successfully!`);
            // Update wallet balance in UI
            break;
          case 'failed':
            alert('Payment failed. Please try again.');
            break;
          case 'cancelled':
            alert('Payment was cancelled.');
            break;
          default:
            alert('Payment is still being processed.');
        }
      }
    } catch (error) {
      console.error('Payment status check failed:', error);
    } finally {
      // Clean up
      localStorage.removeItem('paymentId');
      localStorage.removeItem('paymentAmount');
    }
  }
}

// Usage
const payfast = new PayFastPayment(userToken);

// On payment button click
document.getElementById('payButton').addEventListener('click', () => {
  const amount = document.getElementById('amount').value;
  payfast.initiatePayment(parseFloat(amount));
});

// On return pages (success/cancel)
window.addEventListener('load', () => {
  payfast.handlePaymentReturn();
});
```

## Environment Configuration

### Development Environment (.env)
```env
NODE_ENV=development
PAYFAST_MERCHANT_ID=10004002
PAYFAST_MERCHANT_KEY=q1cd2rdny4a53
PAYFAST_PASSPHRASE=jt7NOE43FZPn
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

### Production Environment (.env.production)
```env
NODE_ENV=production
PAYFAST_MERCHANT_ID=your_live_merchant_id
PAYFAST_MERCHANT_KEY=your_live_merchant_key
PAYFAST_PASSPHRASE=your_live_passphrase
FRONTEND_URL=https://yourapp.com
BACKEND_URL=https://api.yourapp.com
```

## Testing Guide

### 1. Sandbox Testing
PayFast provides sandbox credentials for testing:
- Merchant ID: `10004002`
- Merchant Key: `q1cd2rdny4a53`
- Passphrase: `jt7NOE43FZPn`

### 2. Test Payment Flow
```bash
# 1. Create a test payment
curl -X POST http://localhost:4000/wallet/payfast/create-payment \
  -H "Authorization: Bearer your_test_token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.00, "currency": "ZAR"}'

# 2. Visit the returned payment URL
# Complete payment on PayFast sandbox

# 3. Check payment status
curl -X GET http://localhost:4000/wallet/payfast/status/payment_id \
  -H "Authorization: Bearer your_test_token"
```

### 3. Test Cards
Use these test card details in sandbox:
- **Successful Payment:** `4000000000000002`
- **Failed Payment:** `4000000000000010`
- **Expired Card:** `4000000000000028`

### 4. ITN Testing
You can test ITN webhooks using ngrok for local development:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 4000

# Update your PayFast sandbox settings with:
# ITN URL: https://your-ngrok-url.ngrok.io/wallet/payfast/notify
```

## Security Considerations

### 1. Signature Validation
All PayFast communications include MD5 signatures that must be validated:
- ITN requests are automatically validated
- Invalid signatures are rejected
- Passphrase is used for additional security

### 2. Environment Variables
- Never commit PayFast credentials to version control
- Use different credentials for development and production
- Rotate credentials periodically

### 3. HTTPS Requirements
- Production ITN URLs must use HTTPS
- PayFast requires SSL certificates for live environments

## Error Handling

### Common Error Scenarios

1. **Invalid Amount**
   ```json
   {
     "success": false,
     "message": "Minimum top-up amount is R5"
   }
   ```

2. **Invalid Credentials**
   ```json
   {
     "success": false,
     "message": "PayFast credentials not found in environment variables"
   }
   ```

3. **Invalid Signature**
   ```json
   {
     "success": false,
     "message": "Invalid signature"
   }
   ```

4. **Transaction Not Found**
   ```json
   {
     "success": false,
     "message": "Transaction not found"
   }
   ```

## Migration from PayPal

### Key Changes
1. **API Endpoints**: Updated from `/paypal/*` to `/payfast/*`
2. **Payment Flow**: Direct redirect instead of order creation/capture
3. **Webhooks**: ITN replaces manual capture
4. **Currency**: ZAR is primary currency
5. **Region**: Optimized for South African market

### Migration Checklist
- [ ] Update environment variables
- [ ] Replace PayPal API calls with PayFast
- [ ] Update frontend payment flow
- [ ] Configure ITN webhook URL in PayFast dashboard
- [ ] Test payment flow in sandbox
- [ ] Update error handling
- [ ] Deploy to production 