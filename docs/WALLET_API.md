# Wallet System API Documentation

This document provides comprehensive documentation for the Wallet System APIs in the Rider Backend application.

## Table of Contents

1. [Overview](#overview)
2. [User Wallet APIs](#user-wallet-apis)
3. [PayPal Integration APIs](#paypal-integration-apis)
4. [Driver Wallet APIs](#driver-wallet-apis)
5. [Withdrawal System APIs](#withdrawal-system-apis)
6. [Admin Commission APIs](#admin-commission-apis)
7. [Admin Withdrawal Management APIs](#admin-withdrawal-management-apis)
8. [Ride Allocation APIs](#ride-allocation-apis)

## Overview

The wallet system provides comprehensive payment management for users and drivers, including:
- User wallet top-up via PayPal
- Automatic payment deduction when rides are allocated
- Driver earnings with commission deduction
- Withdrawal request system for drivers
- Admin commission management
- Admin withdrawal approval workflow

## User Wallet APIs

### Get User Wallet Balance
**GET** `/wallet/balance`

Get user's current wallet balance and recent transactions.

**Headers:**
```
Authorization: Bearer <user_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet information retrieved successfully",
  "data": {
    "balance": 150.50,
    "recentTransactions": [
      {
        "_id": "transaction_id",
        "transactionType": "debit",
        "amount": 25.00,
        "balanceAfter": 150.50,
        "description": "Payment for ride from Downtown to Airport",
        "category": "ride_payment",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get User Wallet Transaction History
**GET** `/wallet/transactions`

Get paginated transaction history for the user.

**Headers:**
```
Authorization: Bearer <user_access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category (topup, ride_payment, refund)
- `transactionType` (optional): Filter by type (credit, debit)

## PayFast Integration APIs

### Create PayFast Payment
**POST** `/wallet/payfast/create-payment`

Create a PayFast payment for wallet top-up.

**Headers:**
```
Authorization: Bearer <user_access_token>
```

**Request Body:**
```json
{
  "amount": 50.00,
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
    "amount": 50.00,
    "currency": "ZAR"
  }
}
```

### Check Payment Status
**GET** `/wallet/payfast/status/:paymentId`

Check the status of a PayFast payment.

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
    "amount": 50.00,
    "currency": "ZAR",
    "completedAt": "2024-01-15T14:30:00Z",
    "walletTransaction": {
      "_id": "wallet_transaction_id",
      "amount": 50.00,
      "balanceAfter": 200.50
    }
  }
}
```

## Driver Wallet APIs

### Get Driver Wallet Balance
**GET** `/driver/wallet/balance`

Get driver's current wallet balance and recent transactions.

**Headers:**
```
Authorization: Bearer <driver_access_token>
```

### Create Withdrawal Request
**POST** `/driver/wallet/withdrawal/request`

Create a withdrawal request for driver earnings.

**Headers:**
```
Authorization: Bearer <driver_access_token>
```

**Request Body:**
```json
{
  "amount": 100.00,
  "bankDetails": {
    "accountHolderName": "John Doe",
    "accountNumber": "1234567890",
    "bankName": "Bank of America",
    "routingNumber": "021000021",
    "swiftCode": "BOFAUS3N"
  }
}
```

### Get Driver Withdrawal Requests
**GET** `/driver/wallet/withdrawal/requests`

Get driver's withdrawal request history.

**Headers:**
```
Authorization: Bearer <driver_access_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending, approved, rejected)

## Admin Commission APIs

### Get All Commission Settings
**GET** `/admin/commission`

Get commission settings for all vehicle types.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

### Update Commission Setting
**PUT** `/admin/commission/:vehicleType`

Update commission settings for a specific vehicle type.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "commissionPercentage": 15.0,
  "minimumCommission": 2.00,
  "maximumCommission": 50.00,
  "description": "Updated commission for car rides",
  "isActive": true
}
```

## Admin Withdrawal Management APIs

### Get All Withdrawal Requests
**GET** `/admin/withdrawals`

Get all withdrawal requests with filtering options.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `driverId` (optional): Filter by driver ID

### Approve Withdrawal Request
**PUT** `/admin/withdrawals/:requestId/approve`

Approve a withdrawal request and deduct amount from driver wallet.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "adminNotes": "Approved after verification",
  "transactionId": "bank_transfer_id_123"
}
```

### Reject Withdrawal Request
**PUT** `/admin/withdrawals/:requestId/reject`

Reject a withdrawal request.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "rejectionReason": "Insufficient documentation",
  "adminNotes": "Please provide valid bank statements"
}
```

## Ride Allocation APIs

### Accept Ride
**POST** `/ride-allocation/accept/:rideId`

Accept a ride request (automatically deducts payment from customer wallet).

**Headers:**
```
Authorization: Bearer <driver_access_token>
```

### Complete Ride
**POST** `/ride-allocation/complete/:rideId`

Complete a ride (transfers payment to driver wallet with commission deduction).

**Headers:**
```
Authorization: Bearer <driver_access_token>
```

### Cancel Ride
**POST** `/ride-allocation/cancel/:rideId`

Cancel a ride (refunds customer if payment was already deducted).

**Headers:**
```
Authorization: Bearer <user_or_driver_access_token>
```

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors, insufficient balance)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Wallet Transaction Categories

- `topup` - Wallet top-up via PayPal
- `ride_payment` - Payment for ride (customer)
- `ride_earning` - Earning from ride (driver)
- `withdrawal` - Withdrawal from wallet (driver)
- `commission` - Commission deduction (system)
- `refund` - Refund for cancelled ride

## Withdrawal Request Statuses

- `pending` - Awaiting admin review
- `approved` - Approved by admin, amount deducted
- `rejected` - Rejected by admin
- `processed` - Payment processed to driver
- `failed` - Payment processing failed
