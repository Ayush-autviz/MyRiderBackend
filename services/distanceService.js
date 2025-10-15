const { googleMapsClient } = require('../config/googleMapsConfig');

/**
 * Calculate driving distance between two coordinates
 * Falls back to walking mode, then haversine if needed
 * @param {Object} origin - {latitude, longitude}
 * @param {Object} destination - {latitude, longitude}
 * @param {string} mode - Travel mode (driving, walking, bicycling, transit)
 * @returns {Promise<number>} - Distance in meters
 */
const calculateDistance = async (origin, destination, mode = 'driving') => {
  try {
    // Validate coordinates
    if (!origin || !destination) throw new Error('Origin and destination are required');
    if (!origin.latitude || !origin.longitude || !destination.latitude || !destination.longitude) {
      throw new Error('Invalid coordinate format');
    }

    // Validate coordinate ranges
    if (Math.abs(origin.latitude) > 90 || Math.abs(destination.latitude) > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (Math.abs(origin.longitude) > 180 || Math.abs(destination.longitude) > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const originStr = `${origin.longitude},${origin.latitude}`;
    const destStr = `${destination.longitude},${destination.latitude}`;

    console.log(`Calculating distance: ${originStr} -> ${destStr} (${mode})`);

    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [originStr],
        destinations: [destStr],
        units: 'metric',
        mode,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    // Log full response for debugging
    console.log('API Response:', JSON.stringify(response.data, null, 2));

    const element = response.data.rows[0]?.elements[0];
    
    if (!element) {
      throw new Error('No element in API response');
    }

    if (element.status !== 'OK') {
      console.warn(`Google Maps API (${mode}) status: ${element.status}`);

      // Retry logic if ZERO_RESULTS for driving
      if (element.status === 'ZERO_RESULTS' && mode === 'driving') {
        console.log('Retrying with walking mode...');
        return await calculateDistance(origin, destination, 'walking');
      }

      // If walking also fails, use Haversine
      if (element.status === 'ZERO_RESULTS' && mode === 'walking') {
        console.log('Walking mode also failed, using Haversine fallback');
        return calculateDistanceSimple(origin, destination);
      }

      // For other errors, throw or fallback
      console.log('Using Haversine fallback due to API error');
      return calculateDistanceSimple(origin, destination);
    }

    console.log(`Distance calculated: ${element.distance.value} meters`);
    return element.distance.value; // meters
  } catch (error) {
    console.error('Error calculating distance:', error.message);
    console.log('Falling back to Haversine calculation');
    return calculateDistanceSimple(origin, destination);
  }
};

/**
 * Simple Haversine fallback
 */
const calculateDistanceSimple = (origin, destination) => {
  const R = 6371; // Earth radius in km
  const dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
  const dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
  const lat1 = origin.latitude * Math.PI / 180;
  const lat2 = destination.latitude * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // meters
  
  console.log(`Haversine distance: ${distance} meters`);
  return distance;
};

module.exports = { calculateDistance, calculateDistanceSimple };