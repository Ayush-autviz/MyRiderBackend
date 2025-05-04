# Utility Functions

This directory contains utility functions and data used throughout the application.

## Vehicle Types

The `vehicleTypes.js` file contains the definitions for all vehicle types available in the application. These are stored in memory rather than in a database for simplicity.

### Available Vehicle Types

1. **Bike**
   - ID: `bike`
   - Standard motorcycle for single riders
   - Economical and quick for navigating through traffic
   - Price: ₹8 per km

2. **Car**
   - ID: `car`
   - Standard car for up to 4 passengers
   - Comfortable and spacious for city travel
   - Price: ₹15 per km

3. **Bike with Extra Driver**
   - ID: `bikeWithExtraDriver`
   - Motorcycle with an additional driver
   - Useful for longer trips or when you need a return ride
   - Price: ₹12 per km

4. **Car with Extra Driver**
   - ID: `carWithExtraDriver`
   - Car with an additional driver
   - Ideal for longer trips, events, or when you need a return ride
   - Price: ₹20 per km

### Usage

```javascript
const { 
  vehicleTypes,
  getAllVehicleTypes,
  getVehicleTypeById
} = require('./vehicleTypes');

// Get all vehicle types
const allVehicles = getAllVehicleTypes();

// Get a specific vehicle type
const car = getVehicleTypeById('car');
```
