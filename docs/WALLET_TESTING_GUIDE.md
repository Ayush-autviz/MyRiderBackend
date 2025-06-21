# Wallet System Testing Guide

This guide provides step-by-step instructions for testing the comprehensive wallet system implementation.

## Prerequisites

1. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Update .env with your credentials:
   # - MongoDB URI
   # - PayPal Client ID and Secret (sandbox)
   # - JWT secrets
   # - Twilio credentials (for OTP)
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Initialize Wallet System**
   ```bash
   npm run init-wallet
   ```

4. **Start the Server**
   ```bash
   npm run dev
   ```

## Testing Workflow

### 1. Admin Setup and Commission Management

**Step 1: Admin Login**
```bash
POST /admin/login
{
  "username": "system",
  "password": "system123"
}
```

**Step 2: View Commission Settings**
```bash
GET /admin/commission
Authorization: Bearer <admin_token>
```

**Step 3: Update Commission for Car**
```bash
PUT /admin/commission/car
Authorization: Bearer <admin_token>
{
  "commissionPercentage": 15.0,
  "minimumCommission": 2.00,
  "description": "Updated car commission"
}
```

### 2. User Registration and Wallet Top-up

**Step 1: User Registration/Login**
```bash
POST /auth/login
{
  "phone": "+1234567890"
}

POST /auth/verifyOTP
{
  "phone": "+1234567890",
  "otp": "1234"
}
```

**Step 2: Check Initial Wallet Balance**
```bash
GET /wallet/balance
Authorization: Bearer <user_token>
```

**Step 3: Create PayPal Order**
```bash
POST /wallet/paypal/create-order
Authorization: Bearer <user_token>
{
  "amount": 100.00,
  "currency": "USD"
}
```

**Step 4: Simulate PayPal Payment**
- Use the `approvalUrl` from the response
- Complete payment in PayPal sandbox
- Capture the payment:

```bash
POST /wallet/paypal/capture/{orderId}
Authorization: Bearer <user_token>
```

**Step 5: Verify Wallet Balance**
```bash
GET /wallet/balance
Authorization: Bearer <user_token>
```

### 3. Driver Registration and Setup

**Step 1: Driver Registration**
```bash
POST /driverAuth/login
{
  "phone": "+1234567891"
}

POST /driverAuth/verifyOTP
{
  "phone": "+1234567891",
  "otp": "1234"
}
```

**Step 2: Complete Driver Profile**
- Upload documents
- Set vehicle details
- Get admin approval

**Step 3: Check Driver Wallet**
```bash
GET /driver/wallet/balance
Authorization: Bearer <driver_token>
```

### 4. Ride Creation and Payment Flow

**Step 1: Create Ride (User)**
```bash
POST /ride
Authorization: Bearer <user_token>
{
  "pickupLocation": {
    "address": "123 Main St",
    "coordinates": [-74.006, 40.7128]
  },
  "destination": {
    "address": "456 Broadway",
    "coordinates": [-73.9857, 40.7484]
  },
  "vehicleId": "vehicle_id_here"
}
```

**Expected:** Should check wallet balance and create ride if sufficient funds.

**Step 2: Driver Accepts Ride**
```bash
POST /ride-allocation/accept/{rideId}
Authorization: Bearer <driver_token>
```

**Expected:** Should deduct payment from user wallet.

**Step 3: Start Ride**
```bash
POST /ride-allocation/start/{rideId}
Authorization: Bearer <driver_token>
```

**Step 4: Complete Ride**
```bash
POST /ride-allocation/complete/{rideId}
Authorization: Bearer <driver_token>
```

**Expected:** Should transfer payment to driver wallet with commission deduction.

### 5. Driver Withdrawal Process

**Step 1: Create Withdrawal Request**
```bash
POST /driver/wallet/withdrawal/request
Authorization: Bearer <driver_token>
{
  "amount": 50.00,
  "bankDetails": {
    "accountHolderName": "John Doe",
    "accountNumber": "1234567890",
    "bankName": "Test Bank",
    "routingNumber": "021000021"
  }
}
```

**Step 2: Admin Views Withdrawal Requests**
```bash
GET /admin/withdrawals?status=pending
Authorization: Bearer <admin_token>
```

**Step 3: Admin Approves Withdrawal**
```bash
PUT /admin/withdrawals/{requestId}/approve
Authorization: Bearer <admin_token>
{
  "adminNotes": "Approved after verification",
  "transactionId": "TXN123456"
}
```

**Expected:** Should deduct amount from driver wallet.

### 6. Error Scenarios Testing

**Test 1: Insufficient Wallet Balance**
```bash
# Try to create ride with insufficient balance
POST /ride
Authorization: Bearer <user_token_with_low_balance>
{...ride_details}
```

**Expected:** Should return 400 error with balance details.

**Test 2: Invalid Withdrawal Amount**
```bash
POST /driver/wallet/withdrawal/request
Authorization: Bearer <driver_token>
{
  "amount": 1000000.00,  # More than wallet balance
  "bankDetails": {...}
}
```

**Expected:** Should return 400 error.

**Test 3: Duplicate Pending Withdrawal**
```bash
# Create second withdrawal request while first is pending
POST /driver/wallet/withdrawal/request
Authorization: Bearer <driver_token>
{...withdrawal_details}
```

**Expected:** Should return 400 error.

## Admin Panel Testing

### 1. Access Admin Panel
- Navigate to admin panel URL
- Login with system credentials
- Verify navigation includes "Withdrawals" and "Commission"

### 2. Commission Management
- Navigate to Commission page
- Verify all vehicle types are listed
- Edit commission percentage
- Verify changes are saved

### 3. Withdrawal Management
- Navigate to Withdrawals page
- Verify pending requests are displayed
- Test approve/reject functionality
- Verify status updates correctly

## Verification Checklist

### User Wallet
- [ ] User can top up wallet via PayPal
- [ ] Wallet balance updates correctly after top-up
- [ ] Payment is deducted when ride is allocated
- [ ] Refund is processed when ride is cancelled
- [ ] Transaction history is accurate

### Driver Wallet
- [ ] Driver receives payment after ride completion
- [ ] Commission is deducted correctly
- [ ] Driver can create withdrawal requests
- [ ] Driver can view withdrawal status
- [ ] Wallet balance updates after withdrawal approval

### Admin Functions
- [ ] Admin can view all withdrawal requests
- [ ] Admin can approve/reject withdrawals
- [ ] Admin can manage commission settings
- [ ] Commission changes affect new rides
- [ ] Admin panel displays correct data

### Error Handling
- [ ] Insufficient balance errors are handled
- [ ] Invalid PayPal payments are handled
- [ ] Duplicate withdrawal requests are prevented
- [ ] Unauthorized access is blocked

## Performance Testing

### Load Testing Scenarios
1. **Concurrent Wallet Top-ups**
   - Multiple users topping up simultaneously
   - Verify transaction integrity

2. **Concurrent Ride Payments**
   - Multiple rides being allocated simultaneously
   - Verify wallet balance consistency

3. **Bulk Withdrawal Processing**
   - Admin processing multiple withdrawals
   - Verify system performance

## Security Testing

### Authentication Testing
- [ ] All endpoints require proper authentication
- [ ] JWT tokens are validated correctly
- [ ] Expired tokens are rejected

### Authorization Testing
- [ ] Users can only access their own wallet data
- [ ] Drivers can only access their own withdrawal requests
- [ ] Admin endpoints require admin permissions

### Data Validation
- [ ] Input validation prevents SQL injection
- [ ] Amount validation prevents negative values
- [ ] Bank details validation works correctly

## Troubleshooting

### Common Issues

1. **PayPal Sandbox Issues**
   - Verify sandbox credentials
   - Check PayPal developer console
   - Ensure webhook URLs are correct

2. **Database Connection Issues**
   - Verify MongoDB is running
   - Check connection string
   - Verify database permissions

3. **Commission Calculation Issues**
   - Verify commission settings exist
   - Check calculation logic
   - Verify minimum/maximum limits

### Debug Commands

```bash
# Check database collections
mongo
use myrider
db.wallettransactions.find().limit(5)
db.commissionsettings.find()
db.withdrawalrequests.find()

# Check server logs
tail -f logs/app.log

# Test API endpoints
curl -X GET http://localhost:4000/admin/commission \
  -H "Authorization: Bearer <token>"
```

## Conclusion

This testing guide covers all major wallet system functionality. Follow the steps in order to ensure proper system operation. Report any issues found during testing with detailed steps to reproduce.
