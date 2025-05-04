
const vehicleTypes = [
  {
    id: 'bike',
    type: 'bike',
    pricePerKm: 8,
    description: 'Standard motorcycle for single riders. Economical and quick for navigating through traffic.'
  },
  {
    id: 'car',
    type: 'car',
    pricePerKm: 15,
    description: 'Standard car for up to 4 passengers. Comfortable and spacious for city travel.'
  },
  {
    id: 'bikeWithExtraDriver',
    type: 'bikeWithExtraDriver',
    pricePerKm: 12,
    description: 'Motorcycle with an additional driver for longer trips or when you need a return ride.'
  },
  {
    id: 'carWithExtraDriver',
    type: 'carWithExtraDriver',
    pricePerKm: 20,
    description: 'Car with an additional driver for longer trips, events, or when you need a return ride.'
  }
];

/**
 * Get all vehicle types
 * @returns {Array} Array of vehicle types
 */
const getAllVehicleTypes = () => {
  return vehicleTypes;
};

/**
 * Get a vehicle type by ID
 * @param {string} id - Vehicle type ID
 * @returns {Object|null} Vehicle type object or null if not found
 */
const getVehicleTypeById = (id) => {
  return vehicleTypes.find(vehicle => vehicle.id === id) || null;
};

module.exports = {
  vehicleTypes,
  getAllVehicleTypes,
  getVehicleTypeById
};
