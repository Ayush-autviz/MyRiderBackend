# Wallet System Swagger Documentation

## Overview

The Swagger documentation has been comprehensively updated to include all wallet system APIs. You can access the interactive API documentation at:

```
http://localhost:4000/api-docs
```

## New API Documentation Added

### 1. User Wallet APIs (`/swagger/wallet.js`)

**Endpoints Documented:**
- `GET /wallet/balance` - Get user wallet balance and recent transactions
- `GET /wallet/transactions` - Get paginated wallet transaction history
- `POST /wallet/paypal/create-order` - Create PayPal order for wallet top-up
- `POST /wallet/paypal/capture/{orderId}` - Capture PayPal payment
- `GET /wallet/paypal/transaction/{transactionId}` - Get PayPal transaction details
- `GET /wallet/paypal/history` - Get PayPal transaction history

**Schemas Defined:**
- `WalletTransaction` - Complete transaction object with all fields
- `PayPalOrder` - PayPal order response structure
- `WalletBalance` - Wallet balance with recent transactions

### 2. Driver Wallet APIs (`/swagger/driverWallet.js`)

**Endpoints Documented:**
- `GET /driver/wallet/balance` - Get driver wallet balance
- `GET /driver/wallet/transactions` - Get driver transaction history
- `POST /driver/wallet/withdrawal/request` - Create withdrawal request
- `GET /driver/wallet/withdrawal/requests` - Get withdrawal request history
- `GET /driver/wallet/withdrawal/request/{requestId}` - Get specific withdrawal request
- `PUT /driver/wallet/withdrawal/request/{requestId}/cancel` - Cancel withdrawal request

**Schemas Defined:**
- `WithdrawalRequest` - Complete withdrawal request object
- `BankDetails` - Bank account information structure

### 3. Ride Allocation APIs (`/swagger/rideAllocation.js`)

**Endpoints Documented:**
- `POST /ride-allocation/accept/{rideId}` - Accept ride (deducts customer payment)
- `POST /ride-allocation/reject/{rideId}` - Reject ride request
- `POST /ride-allocation/start/{rideId}` - Start ride (pickup customer)
- `POST /ride-allocation/complete/{rideId}` - Complete ride (transfer earnings)
- `POST /ride-allocation/cancel/{rideId}` - Cancel ride (process refunds)

**Schemas Defined:**
- `RideAllocationResponse` - Response when ride is accepted
- `RideCompletionResponse` - Response with payment breakdown
- `RideCancellationRequest` - Cancellation request structure

### 4. Admin Wallet Management APIs (Updated `swagger/admin.js`)

**New Endpoints Added:**

#### Commission Management:
- `GET /admin/commission` - Get all commission settings
- `GET /admin/commission/{vehicleType}` - Get commission by vehicle type
- `PUT /admin/commission/{vehicleType}` - Update commission settings
- `DELETE /admin/commission/{vehicleType}` - Delete commission setting
- `POST /admin/commission/initialize` - Initialize default commission settings

#### Withdrawal Management:
- `GET /admin/withdrawals` - Get all withdrawal requests with filtering
- `PUT /admin/withdrawals/{requestId}/approve` - Approve withdrawal request
- `PUT /admin/withdrawals/{requestId}/reject` - Reject withdrawal request

**New Schemas Added:**
- `CommissionSetting` - Commission configuration object
- `AdminWithdrawalRequest` - Withdrawal request with driver details

### 5. Updated Ride APIs (`swagger/ride.js`)

**Enhanced Documentation:**
- Updated `POST /ride/create` to include wallet balance validation errors
- Added detailed error responses for insufficient balance scenarios
- Included balance shortfall information in error responses

## Key Features of the Documentation

### 1. **Comprehensive Error Handling**
All endpoints include detailed error responses:
- `400` - Validation errors, insufficient balance
- `401` - Authentication errors
- `403` - Permission errors
- `404` - Resource not found
- `500` - Server errors

### 2. **Request/Response Examples**
Each endpoint includes:
- Complete request body schemas
- Detailed response structures
- Example values for all fields
- Proper data types and validation rules

### 3. **Security Documentation**
All protected endpoints clearly show:
- Required authentication (Bearer tokens)
- Role-based access requirements
- Permission levels needed

### 4. **Query Parameters**
Comprehensive documentation for:
- Pagination parameters
- Filtering options
- Sorting capabilities
- Search functionality

### 5. **Schema Relationships**
Clear documentation of:
- Object relationships
- Reference fields
- Nested objects
- Array structures

## How to Use the Documentation

### 1. **Access Swagger UI**
```bash
# Start your server
npm run dev

# Open browser and navigate to:
http://localhost:4000/api-docs
```

### 2. **Test APIs Directly**
- Use the "Try it out" feature in Swagger UI
- Add your Bearer token in the Authorization section
- Test all endpoints with real data

### 3. **Generate Client Code**
- Use Swagger Codegen to generate client libraries
- Export OpenAPI specification for integration
- Share API documentation with frontend teams

### 4. **API Testing Workflow**
1. **Authentication**: Start with admin/user login endpoints
2. **Wallet Setup**: Test PayPal integration and wallet top-up
3. **Commission Config**: Set up commission rates via admin APIs
4. **Ride Flow**: Test complete ride lifecycle with payments
5. **Withdrawals**: Test driver withdrawal request and approval

## Example API Testing Sequence

### 1. Admin Setup
```bash
POST /admin/login
POST /admin/commission/initialize
PUT /admin/commission/car (update commission rate)
```

### 2. User Wallet Top-up
```bash
POST /auth/login (user login)
GET /wallet/balance (check initial balance)
POST /wallet/paypal/create-order (create PayPal order)
POST /wallet/paypal/capture/{orderId} (capture payment)
```

### 3. Ride with Payment
```bash
POST /ride/create (creates ride, validates balance)
POST /ride-allocation/accept/{rideId} (driver accepts, deducts payment)
POST /ride-allocation/complete/{rideId} (completes ride, transfers earnings)
```

### 4. Driver Withdrawal
```bash
POST /driver/wallet/withdrawal/request (driver requests withdrawal)
GET /admin/withdrawals (admin views requests)
PUT /admin/withdrawals/{requestId}/approve (admin approves)
```

## Documentation Standards

### 1. **Consistent Naming**
- Clear, descriptive endpoint names
- Consistent parameter naming
- Standardized response structures

### 2. **Complete Type Information**
- All fields have proper data types
- Validation rules are documented
- Required vs optional fields are clear

### 3. **Real-world Examples**
- Practical example values
- Common use case scenarios
- Error condition examples

### 4. **Security Best Practices**
- Authentication requirements clearly marked
- Permission levels documented
- Sensitive data handling noted

## Maintenance

The Swagger documentation is automatically generated from the JSDoc comments in the API files. To update:

1. **Add New Endpoints**: Create new swagger files in `/swagger/` directory
2. **Update Existing**: Modify the corresponding swagger file
3. **Schema Changes**: Update schema definitions in the relevant files
4. **Auto-reload**: Swagger UI automatically reflects changes on server restart

## Integration with Frontend

The comprehensive Swagger documentation enables:
- **Type-safe API clients**: Generate TypeScript interfaces
- **Mock data generation**: Use schemas for testing
- **API validation**: Ensure request/response compliance
- **Team collaboration**: Share consistent API contracts

This documentation provides a complete reference for all wallet system functionality and serves as the single source of truth for API integration.
