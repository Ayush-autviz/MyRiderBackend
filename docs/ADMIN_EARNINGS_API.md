# Admin Earnings API Documentation

## Overview

The Admin Earnings API provides comprehensive functionality for tracking and analyzing admin earnings from completed rides. When a ride is completed, the system automatically calculates and records the commission (20% by default) that goes to the admin, while the remaining 80% goes to the driver.

## Authentication

All admin earnings endpoints require admin authentication. Include the admin JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Base URL

```
/admin/earnings
```

## Endpoints

### 1. Get Total Earnings Summary

**GET** `/admin/earnings/total`

Returns overall earnings statistics including total commission, number of rides, and average commission per ride.

**Response:**
```json
{
  "success": true,
  "message": "Total earnings retrieved successfully",
  "data": {
    "totalCommission": 1500.50,
    "totalRides": 150,
    "averageCommission": 10.00
  }
}
```

### 2. Get Earnings by Date Range

**GET** `/admin/earnings/date-range?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20`

Returns paginated earnings data for a specific date range with summary statistics.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Earnings retrieved successfully",
  "data": {
    "earnings": [
      {
        "_id": "64f5f3b3e8c1a2b3c4d5e6f7",
        "ride": "64f5f3b3e8c1a2b3c4d5e6f8",
        "customer": {
          "_id": "64f5f3b3e8c1a2b3c4d5e6f9",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "driver": {
          "_id": "64f5f3b3e8c1a2b3c4d5e6fa",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "phone": "+0987654321"
        },
        "totalFare": 25.50,
        "commissionAmount": 5.10,
        "commissionPercentage": 20,
        "driverEarning": 20.40,
        "vehicleType": "car",
        "pickupLocation": {
          "address": "123 Main St, City",
          "coordinates": [-74.006, 40.7128]
        },
        "destination": {
          "address": "456 Oak Ave, City",
          "coordinates": [-74.0059, 40.7127]
        },
        "rideDistance": 5.2,
        "completedAt": "2024-01-15T14:30:00.000Z",
        "createdAt": "2024-01-15T14:30:00.000Z",
        "updatedAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalCount": 150,
      "limit": 20
    },
    "summary": {
      "totalCommission": 765.50,
      "totalRides": 75,
      "totalFareAmount": 3827.50,
      "averageCommission": 10.21,
      "averageFare": 51.03
    },
    "dateRange": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

### 3. Get Daily Earnings Summary

**GET** `/admin/earnings/daily-summary?days=30`

Returns daily earnings breakdown for the specified number of days.

**Query Parameters:**
- `days` (optional): Number of days to fetch (1-365, default: 30)

**Response:**
```json
{
  "success": true,
  "message": "Daily earnings summary retrieved successfully",
  "data": {
    "summary": [
      {
        "date": "2024-01-31",
        "earnings": 45.20,
        "ridesCount": 4,
        "averageFare": 56.50,
        "averageCommission": 11.30
      },
      {
        "date": "2024-01-30",
        "earnings": 38.70,
        "ridesCount": 3,
        "averageFare": 64.50,
        "averageCommission": 12.90
      }
    ],
    "period": "Last 30 days"
  }
}
```

### 4. Get Monthly Earnings Summary

**GET** `/admin/earnings/monthly-summary?months=12`

Returns monthly earnings breakdown for the specified number of months.

**Query Parameters:**
- `months` (optional): Number of months to fetch (1-24, default: 12)

**Response:**
```json
{
  "success": true,
  "message": "Monthly earnings summary retrieved successfully",
  "data": {
    "summary": [
      {
        "month": "2024-01",
        "earnings": 1350.80,
        "ridesCount": 120,
        "averageFare": 56.28,
        "averageCommission": 11.26
      },
      {
        "month": "2023-12",
        "earnings": 1201.40,
        "ridesCount": 110,
        "averageFare": 54.61,
        "averageCommission": 10.92
      }
    ],
    "period": "Last 12 months"
  }
}
```

### 5. Get Earnings by Vehicle Type

**GET** `/admin/earnings/by-vehicle-type?startDate=2024-01-01&endDate=2024-01-31`

Returns earnings breakdown by vehicle type, optionally filtered by date range.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "message": "Earnings by vehicle type retrieved successfully",
  "data": [
    {
      "_id": "car",
      "totalCommission": 980.50,
      "totalRides": 85,
      "totalFareAmount": 4902.50,
      "averageCommission": 11.54,
      "averageFare": 57.68,
      "averageDistance": 8.2
    },
    {
      "_id": "bike",
      "totalCommission": 285.30,
      "totalRides": 45,
      "totalFareAmount": 1426.50,
      "averageCommission": 6.34,
      "averageFare": 31.70,
      "averageDistance": 4.1
    }
  ]
}
```

### 6. Get Specific Earning Details

**GET** `/admin/earnings/{earningId}`

Returns detailed information about a specific earning record.

**Path Parameters:**
- `earningId` (required): The ID of the earning record

**Response:**
```json
{
  "success": true,
  "message": "Earning details retrieved successfully",
  "data": {
    "_id": "64f5f3b3e8c1a2b3c4d5e6f7",
    "ride": {
      "_id": "64f5f3b3e8c1a2b3c4d5e6f8",
      "status": "completed",
      "rating": 5,
      "review": "Great ride!",
      "distance": 5.2
    },
    "customer": {
      "_id": "64f5f3b3e8c1a2b3c4d5e6f9",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "profileImage": "https://example.com/profile.jpg"
    },
    "driver": {
      "_id": "64f5f3b3e8c1a2b3c4d5e6fa",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+0987654321",
      "profileImage": "https://example.com/driver.jpg",
      "vehicleDetails": {
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "licensePlate": "ABC123"
      }
    },
    "totalFare": 25.50,
    "commissionAmount": 5.10,
    "commissionPercentage": 20,
    "driverEarning": 20.40,
    "vehicleType": "car",
    "pickupLocation": {
      "address": "123 Main St, City",
      "coordinates": [-74.006, 40.7128]
    },
    "destination": {
      "address": "456 Oak Ave, City",
      "coordinates": [-74.0059, 40.7127]
    },
    "rideDistance": 5.2,
    "completedAt": "2024-01-15T14:30:00.000Z",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Start date and end date are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Earning record not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## How Admin Earnings Work

1. **Ride Completion**: When a driver completes a ride, the system automatically:
   - Calculates the commission based on the current commission rate (default 20%)
   - Transfers the driver's share (80%) to their wallet
   - Records the admin's commission (20%) in the AdminEarnings collection

2. **Commission Calculation**: 
   - Total Fare: $25.50
   - Commission (20%): $5.10 (goes to admin)
   - Driver Earning (80%): $20.40 (goes to driver)

3. **Tracking**: Every completed ride automatically creates an AdminEarnings record with:
   - Ride details (pickup, destination, distance)
   - Customer and driver information
   - Financial breakdown (total fare, commission, driver earning)
   - Timestamps and metadata

## Usage Examples

### Get earnings for the current month
```bash
curl -X GET "https://your-api.com/admin/earnings/date-range?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get last 7 days daily summary
```bash
curl -X GET "https://your-api.com/admin/earnings/daily-summary?days=7" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get earnings by vehicle type for last month
```bash
curl -X GET "https://your-api.com/admin/earnings/by-vehicle-type?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Notes

- All monetary values are in the base currency (USD by default)
- Dates are in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- Pagination is available for endpoints that return multiple records
- Commission rates can be configured through the CommissionSettings model
- All endpoints require admin authentication 