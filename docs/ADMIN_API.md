# Admin Panel APIs Documentation

This document provides comprehensive documentation for all Admin Panel APIs in the Rider Backend application.

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard & Analytics](#dashboard--analytics)
3. [User Management](#user-management)
4. [Driver Management](#driver-management)
5. [Ride Management](#ride-management)
6. [Setup Instructions](#setup-instructions)

## Base URL

All admin APIs are prefixed with `/admin`

Example: `http://localhost:3000/admin/login`

## Authentication

### Admin Login
**POST** `/admin/login`

Login with admin credentials to get access tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": "admin_id",
      "username": "admin",
      "email": "admin@rider.com",
      "firstName": "Super",
      "lastName": "Admin",
      "role": "super_admin",
      "permissions": ["users_read", "users_write", ...]
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Refresh Token
**POST** `/admin/refresh-token`

Refresh the access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

## Dashboard & Analytics

### Get Dashboard Statistics
**GET** `/admin/dashboard/stats`

Get overview statistics for the admin dashboard.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "users": {
      "total": 150,
      "active": 140
    },
    "drivers": {
      "total": 75,
      "active": 60,
      "pending": 10
    },
    "rides": {
      "total": 500,
      "completed": 450,
      "today": 25
    },
    "revenue": {
      "total": 15000
    }
  }
}
```

### Get Analytics Data
**GET** `/admin/analytics?period=7d`

Get detailed analytics data for specified period.

**Query Parameters:**
- `period`: `7d`, `30d`, `90d`, `1y` (default: `7d`)

**Headers:**
```
Authorization: Bearer <access_token>
```

## User Management

### Get All Users
**GET** `/admin/users`

Get paginated list of all users with search and filter options.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name, email, or phone
- `status`: Filter by status (0=inactive, 1=active, 2=suspended)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order - asc/desc (default: desc)

**Headers:**
```
Authorization: Bearer <access_token>
```

### Get User Details
**GET** `/admin/users/{userId}`

Get detailed information about a specific user.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Update User Status
**PUT** `/admin/users/{userId}/status`

Update user account status.

**Request Body:**
```json
{
  "status": 1
}
```
Status values: 0=inactive, 1=active, 2=suspended

**Headers:**
```
Authorization: Bearer <access_token>
```

### Get User Rides
**GET** `/admin/users/{userId}/rides`

Get ride history for a specific user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by ride status

**Headers:**
```
Authorization: Bearer <access_token>
```

## Driver Management

### Get All Drivers
**GET** `/admin/drivers`

Get paginated list of all drivers with search and filter options.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name, email, phone, or license
- `status`: Filter by account status
- `vehicleType`: Filter by vehicle type (car/bike)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order - asc/desc (default: desc)

**Headers:**
```
Authorization: Bearer <access_token>
```

### Get Driver Details
**GET** `/admin/drivers/{driverId}`

Get detailed information about a specific driver.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Approve/Reject Driver
**PUT** `/admin/drivers/{driverId}/approval`

Approve or reject a driver application.

**Request Body:**
```json
{
  "action": "approve",
  "reason": "Optional rejection reason"
}
```
Action values: "approve" or "reject"

**Headers:**
```
Authorization: Bearer <access_token>
```

### Update Driver Status
**PUT** `/admin/drivers/{driverId}/status`

Update driver account status.

**Request Body:**
```json
{
  "status": "active"
}
```
Status values: "active", "suspended", "rejected"

**Headers:**
```
Authorization: Bearer <access_token>
```

### Get Driver Rides
**GET** `/admin/drivers/{driverId}/rides`

Get ride history for a specific driver.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by ride status

**Headers:**
```
Authorization: Bearer <access_token>
```

## Ride Management

### Get All Rides
**GET** `/admin/rides`

Get paginated list of all rides with search and filter options.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by ride status
- `dateFrom`: Filter rides from this date (YYYY-MM-DD)
- `dateTo`: Filter rides to this date (YYYY-MM-DD)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order - asc/desc (default: desc)

**Headers:**
```
Authorization: Bearer <access_token>
```

### Get Ride Details
**GET** `/admin/rides/{rideId}`

Get detailed information about a specific ride.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Cancel Ride
**PUT** `/admin/rides/{rideId}/cancel`

Cancel a ride (admin override).

**Request Body:**
```json
{
  "reason": "Cancelled by admin due to policy violation"
}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

## Setup Instructions

### 1. Create Admin User

Run the following command to create the first admin user:

```bash
node scripts/createAdmin.js
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`
- Email: `admin@rider.com`
- Role: `super_admin`

### 2. Admin Permissions

The system supports role-based permissions:

**Available Permissions:**
- `users_read`: View users
- `users_write`: Edit users
- `users_delete`: Delete users
- `drivers_read`: View drivers
- `drivers_write`: Edit drivers
- `drivers_delete`: Delete drivers
- `drivers_approve`: Approve/reject drivers
- `rides_read`: View rides
- `rides_write`: Edit rides
- `rides_cancel`: Cancel rides
- `analytics_read`: View analytics
- `system_settings`: System configuration

**Available Roles:**
- `super_admin`: All permissions
- `admin`: Most permissions except system settings
- `moderator`: Limited permissions

### 3. API Testing

You can test the APIs using:

1. **Swagger UI**: Visit `http://localhost:3000/api-docs`
2. **Postman**: Import the API collection
3. **cURL**: Use command line requests

### 4. Security Notes

- All admin APIs require authentication via JWT tokens
- Tokens expire after 15 minutes (configurable)
- Refresh tokens are valid for 7 days (configurable)
- Role-based access control is enforced on all endpoints
- Admin accounts can be deactivated for security

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error
