# Vehicle Management API Documentation

## Overview

The Vehicle Management API allows administrators to view and update vehicle types and their pricing for the ride-sharing platform. This feature enables dynamic pricing control for different vehicle types.

## Vehicle Types

The system supports the following vehicle types:
- `bike` - Standard motorcycle for single riders
- `car` - Standard car for up to 4 passengers
- `bikeWithExtraDriver` - Motorcycle with an additional driver
- `carWithExtraDriver` - Car with an additional driver

## API Endpoints

### 1. Get All Vehicles

**Endpoint:** `GET /admin/vehicles`

**Description:** Retrieve all vehicle types with their current pricing.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": {
    "vehicles": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "type": "bike",
        "pricePerKm": 8,
        "description": "Standard motorcycle for single riders. Economical and quick for navigating through traffic.",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "type": "car",
        "pricePerKm": 15,
        "description": "Standard car for up to 4 passengers. Comfortable and spacious for city travel.",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 4
  }
}
```

### 2. Get Vehicle Details

**Endpoint:** `GET /admin/vehicles/:vehicleId`

**Description:** Retrieve details of a specific vehicle type.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Parameters:**
- `vehicleId` (string, required) - The ID of the vehicle

**Response:**
```json
{
  "success": true,
  "message": "Vehicle details retrieved successfully",
  "data": {
    "vehicle": {
      "_id": "507f1f77bcf86cd799439011",
      "type": "bike",
      "pricePerKm": 8,
      "description": "Standard motorcycle for single riders. Economical and quick for navigating through traffic.",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Update Vehicle Price

**Endpoint:** `PUT /admin/vehicles/:vehicleId/price`

**Description:** Update the price per kilometer for a specific vehicle type.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Parameters:**
- `vehicleId` (string, required) - The ID of the vehicle

**Request Body:**
```json
{
  "pricePerKm": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle price updated successfully",
  "data": {
    "vehicle": {
      "id": "507f1f77bcf86cd799439011",
      "type": "bike",
      "pricePerKm": 10,
      "description": "Standard motorcycle for single riders. Economical and quick for navigating through traffic.",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "change": {
      "oldPrice": 8,
      "newPrice": 10,
      "difference": 2
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Valid price per km is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden - Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Vehicle not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to update vehicle price"
}
```

## Frontend Integration

### Vehicle Management Page

The admin panel includes a dedicated vehicle management page at `/dashboard/vehicles` that provides:

1. **Vehicle Cards**: Display all vehicle types with current pricing
2. **Edit Functionality**: Modal dialog to update vehicle prices
3. **Real-time Updates**: Automatic refresh after price changes
4. **Visual Indicators**: Color-coded badges for different vehicle types

### Key Features

- **Responsive Design**: Works on desktop and mobile devices
- **Input Validation**: Ensures valid price inputs
- **Loading States**: Shows loading indicators during API calls
- **Error Handling**: Displays user-friendly error messages
- **Success Feedback**: Confirms successful price updates

## Database Schema

### Vehicle Model

```javascript
const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bike', 'car', 'carWithExtraDriver', 'bikeWithExtraDriver'],
    required: true,
    unique: true,
  },
  pricePerKm: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
```

## Seeding Data

The system automatically seeds vehicle data on startup if no vehicles exist:

```javascript
const vehicleData = [
  {
    type: 'bike',
    pricePerKm: 8,
    description: 'Standard motorcycle for single riders. Economical and quick for navigating through traffic.'
  },
  {
    type: 'car',
    pricePerKm: 15,
    description: 'Standard car for up to 4 passengers. Comfortable and spacious for city travel.'
  },
  {
    type: 'bikeWithExtraDriver',
    pricePerKm: 12,
    description: 'Motorcycle with an additional driver for longer trips or when you need a return ride.'
  },
  {
    type: 'carWithExtraDriver',
    pricePerKm: 20,
    description: 'Car with an additional driver for longer trips, events, or when you need a return ride.'
  }
];
```

## Testing

### Manual Testing

1. Start the server: `npm start`
2. Run the test script: `npm run test-vehicles`
3. Check the admin panel at `/dashboard/vehicles`

### API Testing

Use the provided test script to verify all endpoints:

```bash
node test-vehicle-api.js
```

## Security

- All endpoints require admin authentication
- Price updates require `system_settings` permission
- Input validation prevents invalid price values
- Audit trail shows price change history

## Impact on Ride Pricing

When vehicle prices are updated:

1. **New Rides**: Will use the updated pricing immediately
2. **Active Rides**: Continue with the original pricing
3. **Fare Calculation**: Based on distance × updated price per km
4. **Commission**: Calculated from the total fare amount

## Best Practices

1. **Gradual Changes**: Avoid sudden large price increases
2. **Market Research**: Base pricing on local market conditions
3. **Regular Reviews**: Monitor pricing effectiveness
4. **Documentation**: Keep records of price change reasons
5. **Testing**: Test price changes in staging environment first

## Troubleshooting

### Common Issues

1. **Price Not Updating**: Check admin permissions
2. **Invalid Price Error**: Ensure price is a positive number
3. **Vehicle Not Found**: Verify vehicle ID is correct
4. **Permission Denied**: Ensure user has system_settings permission

### Debug Steps

1. Check server logs for error messages
2. Verify database connection
3. Test API endpoints directly
4. Check frontend console for errors
5. Validate admin token is valid 