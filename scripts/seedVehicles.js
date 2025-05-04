require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data for vehicles
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

// Seed vehicles
const seedVehicles = async () => {
  try {
    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log('Cleared existing vehicle data');

    // Insert new vehicle data
    const vehicles = await Vehicle.insertMany(vehicleData);
    console.log(`${vehicles.length} vehicle types seeded successfully`);
    
    // Log the seeded data
    console.log('Seeded vehicle data:');
    vehicles.forEach(vehicle => {
      console.log(`- ${vehicle.type}: ₹${vehicle.pricePerKm} per km`);
    });

    return vehicles;
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    process.exit(1);
  }
};

// Run the seeding process
const runSeed = async () => {
  try {
    await connectDB();
    await seedVehicles();
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error in seeding process:', error);
    process.exit(1);
  }
};

// Execute the seed script
runSeed();
