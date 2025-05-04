# Seed Scripts

This directory contains scripts for seeding the database with initial data.

## Vehicle Seed Script

The `seedVehicles.js` script initializes the database with vehicle types and their pricing information.

### Usage

To run the script:

```bash
node scripts/seedVehicles.js
```

### Vehicle Types

The script creates the following vehicle types:

1. **Bike**
   - Standard motorcycle for single riders
   - Economical and quick for navigating through traffic
   - Price: ₹8 per km

2. **Car**
   - Standard car for up to 4 passengers
   - Comfortable and spacious for city travel
   - Price: ₹15 per km

3. **Bike with Extra Driver**
   - Motorcycle with an additional driver
   - Useful for longer trips or when you need a return ride
   - Price: ₹12 per km

4. **Car with Extra Driver**
   - Car with an additional driver
   - Ideal for longer trips, events, or when you need a return ride
   - Price: ₹20 per km

### Notes

- Running this script will delete all existing vehicle data before adding the new data
- Make sure your MongoDB connection is properly configured in your `.env` file
- The script requires the `MONGO_URI` environment variable to be set
