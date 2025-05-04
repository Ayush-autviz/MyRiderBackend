const express = require('express');
const router = express.Router();

const {
  calculateRidePrices,
  getAllVehicles,
  getVehicleById,
  getVehicleByType
} = require('../controllers/Vehicle');

// Get all vehicle types
router.get('/', getAllVehicles);

// Calculate ride prices
router.post('/calculate-prices', calculateRidePrices);

// Get vehicle by type
router.get('/type/:type', getVehicleByType);

// Get vehicle by ID - keep this last to avoid conflicts with other routes
router.get('/:id', getVehicleById);

module.exports = router;
