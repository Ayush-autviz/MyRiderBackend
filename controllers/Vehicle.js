const { calculateDistance } = require('../services/distanceService');
const { StatusCodes } = require('http-status-codes');
const Vehicle = require('../models/Vehicle');
const { normalizeCoordinates, validateCoordinates } = require('../utils/coordinateHelpers');

// Get all vehicle types
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().select('-__v').sort('pricePerKm');

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Vehicle types retrieved successfully',
      data: vehicles
    });
  } catch (error) {
    console.error('Error retrieving vehicle types:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id).select('-__v');

    if (!vehicle) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Vehicle type not found',
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Vehicle type retrieved successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error retrieving vehicle type:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get vehicle by type
const getVehicleByType = async (req, res) => {
  try {
    const { type } = req.params;

    const vehicle = await Vehicle.findOne({ type }).select('-__v');

    if (!vehicle) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Vehicle type not found',
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Vehicle type retrieved successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error retrieving vehicle type:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const calculateRidePrices = async (req, res) => {
  try {
    const { pickupCoords, destinationCoords } = req.body;

    if (!pickupCoords || !destinationCoords) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Pickup and destination coordinates are required'
      });
    }

    // Normalize and validate coordinates
    let normalizedPickup, normalizedDestination;
    
    try {
      normalizedPickup = normalizeCoordinates(pickupCoords);
      normalizedDestination = normalizeCoordinates(destinationCoords);
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Invalid coordinate format: ${error.message}`
      });
    }

    // Validate coordinate ranges
    if (!validateCoordinates(normalizedPickup) || !validateCoordinates(normalizedDestination)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Coordinates are out of valid range. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Calculate distance in kilometers
    const distanceMeters = await calculateDistance(normalizedPickup, normalizedDestination);
    const distanceKm = distanceMeters / 1000;

    // Get all vehicle types and their prices
    const vehicles = await Vehicle.find().select('-__v');

    // Calculate price for each vehicle type
    const priceEstimates = vehicles.map(vehicle => ({
      vehicleId: vehicle._id,
      vehicleType: vehicle.type,
      price: (vehicle.pricePerKm * distanceKm).toFixed(2),
      distance: distanceKm.toFixed(2),
      description: vehicle.description || '',
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Price estimates calculated successfully',
      data: {
        priceEstimates,
        totalDistance: distanceKm.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating ride prices:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error while calculating prices',
      error: error.message
    });
  }
};

module.exports = {
  calculateRidePrices,
  getAllVehicles,
  getVehicleById,
  getVehicleByType
};