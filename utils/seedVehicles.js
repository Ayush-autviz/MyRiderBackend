const Vehicle = require('../models/Vehicle');

/**
 * Seed vehicle data into the database if it doesn't exist
 */
const seedVehicles = async () => {
  try {
    // Check if vehicles already exist
    const count = await Vehicle.countDocuments();
    
    // If vehicles already exist, don't seed
    if (count > 0) {
      console.log(`Database already has ${count} vehicle types. Skipping seed.`);
      return;
    }
    
    // Vehicle data to seed
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
    
    // Insert vehicle data
    const vehicles = await Vehicle.insertMany(vehicleData);
    console.log(`Seeded ${vehicles.length} vehicle types successfully.`);
    
    // Log the seeded data
    vehicles.forEach(vehicle => {
      console.log(`- ${vehicle.type}: ₹${vehicle.pricePerKm} per km`);
    });
    
    return vehicles;
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    throw error;
  }
};

module.exports = seedVehicles;
