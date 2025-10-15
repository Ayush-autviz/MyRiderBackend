# Delete Account API Documentation

This document describes the APIs for deleting user and driver accounts in the MyRider backend system.

## Overview

The delete account APIs allow users and drivers to permanently remove their accounts and all associated data from the system. These operations are irreversible and will clean up all related records including rides, transactions, ratings, and uploaded files.

## Security Considerations

- **No Authentication Required**: These endpoints are intentionally designed without authentication to allow account deletion even if users lose access to their accounts
- **Phone Number Verification**: Deletion is based on phone number identification
- **Business Logic Validation**: Prevents deletion of accounts with active rides or online drivers

## User Account Deletion

### Endpoint
```
DELETE /auth/delete-account
```

### Request Body
```json
{
  "phone": "+919876543210"
}
```

### Response
#### Success (200)
```json
{
  "success": true,
  "message": "User account deleted successfully",
  "data": {
    "deletedUserId": "60d0fe4f5311236168a109ca",
    "phone": "+919876543210"
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing phone number or user has active ride
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error during deletion

### Data Cleanup
When a user account is deleted, the following related data is also removed:
- All rides associated with the user
- All wallet transactions
- All PayFast transactions
- All ratings given by the user

### Business Rules
- Cannot delete account while having an active ride
- Phone number is required
- Deletion is permanent and irreversible

## Driver Account Deletion

### Endpoint
```
DELETE /driverAuth/delete-account
```

### Request Body
```json
{
  "phone": "+919876543210"
}
```

### Response
#### Success (200)
```json
{
  "success": true,
  "message": "Driver account deleted successfully",
  "data": {
    "deletedDriverId": "60d0fe4f5311236168a109cb",
    "phone": "+919876543210",
    "deletedFiles": 5
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing phone number or driver is online/has active ride
- **404 Not Found**: Driver not found
- **500 Internal Server Error**: Server error during deletion

### Data Cleanup
When a driver account is deleted, the following related data is also removed:
- All rides associated with the driver
- All wallet transactions
- All withdrawal requests
- All ratings for the driver
- All fellow driver relationships
- All admin earnings records
- All uploaded files (vehicle images, documents, profile photos)

### Business Rules
- Cannot delete account while online
- Cannot delete account while having an active ride
- Phone number is required
- Deletion is permanent and irreversible
- All uploaded files are physically deleted from the server

## Testing

### Test Script
A test script is provided at `test_delete_accounts.js` to verify the APIs work correctly.

### Running Tests
```bash
# Install axios if not already installed
npm install axios

# Run the test script
node test_delete_accounts.js
```

### Test Cases
1. **Missing Phone Number**: Tests validation for required phone field
2. **Invalid Phone Number**: Tests handling of non-existent accounts
3. **User Account Deletion**: Tests successful user account deletion
4. **Driver Account Deletion**: Tests successful driver account deletion

## Implementation Details

### Controllers
- **UserAuth.js**: Contains `deleteUserAccount` function
- **DriverAuth.js**: Contains `deleteDriverAccount` function

### Routes
- **auth.js**: `/auth/delete-account` endpoint
- **driverAuth.js**: `/driverAuth/delete-account` endpoint

### Models Referenced
- User
- Driver
- Ride
- WalletTransaction
- PayFastTransaction
- Rating
- WithdrawalRequest
- FellowDriver
- AdminEarnings

### File System Operations
- Driver account deletion includes cleanup of uploaded files
- Uses Node.js `fs.promises.unlink()` for file deletion
- Gracefully handles file deletion errors

## Error Handling

### Validation Errors
- Phone number format validation
- Required field validation
- Business rule validation (active rides, online status)

### Database Errors
- Graceful handling of database operation failures
- Transaction rollback on partial failures
- Detailed error logging

### File System Errors
- Graceful handling of file deletion failures
- Continues with account deletion even if file cleanup fails
- Logs file deletion errors for investigation

## Monitoring and Logging

### Console Logging
- All deletion operations are logged to console
- File deletion failures are logged with file paths
- Error details are logged for debugging

### Response Logging
- Success responses include operation details
- Error responses include detailed error messages
- File cleanup statistics are included in driver deletion responses

## Future Enhancements

### Potential Improvements
1. **Soft Delete**: Implement soft delete with account recovery options
2. **Audit Trail**: Log all deletion operations for compliance
3. **Batch Operations**: Support for bulk account deletion
4. **Admin Override**: Admin-only endpoints for forced account deletion
5. **Data Export**: Option to export user data before deletion

### Security Enhancements
1. **Rate Limiting**: Prevent abuse of deletion endpoints
2. **Phone Verification**: Require OTP verification before deletion
3. **Cooling Period**: Implement delay before permanent deletion
4. **Notification**: Send confirmation emails/SMS before deletion

## Support

For questions or issues related to the delete account APIs, please refer to:
- API documentation in Swagger
- Test scripts for usage examples
- Console logs for debugging information
- Database models for data structure details







