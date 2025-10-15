const { googleMapsClient } = require('../config/googleMapsConfig');

/**
 * Calculate distance between two coordinates using Google Maps Distance Matrix API
 * @param {Object} origin - Origin coordinates {latitude, longitude}
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @returns {Promise<number>} - Distance in meters
 */

const calculateDistance = async (origin, destination) => {
  try {
    // Validate coordinates
    if (!origin || !destination) {
      throw new Error('Origin and destination coordinates are required');
    }

    if (!origin.latitude || !origin.longitude || !destination.latitude || !destination.longitude) {
      throw new Error('Invalid coordinate format. Latitude and longitude are required for both origin and destination');
    }

    // Check if Google Maps API key is configured
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn('GOOGLE_MAPS_API_KEY not found, falling back to basic calculation');
      // Fallback to simple calculation if no API key (not accurate for long distances)
      return calculateDistanceSimple(origin, destination);
    }

    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${origin.latitude},${origin.longitude}`],
        destinations: [`${destination.latitude},${destination.longitude}`],
        units: 'metric',
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    // Check if the response is valid
    if (response.data.status !== 'OK') {
      console.error('Google Maps Distance Matrix API error:', response.data.error_message || response.data.status);
      // Fallback to simple calculation
      return calculateDistanceSimple(origin, destination);
    }

    const element = response.data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      console.error('Distance Matrix API element error:', element?.status);
      // Fallback to simple calculation
      return calculateDistanceSimple(origin, destination);
    }

    // Return distance in meters
    return element.distance.value;

  } catch (error) {
    console.error('Error calculating distance with Google Maps API:', error.message);

    // Fallback to simple calculation
    try {
      return calculateDistanceSimple(origin, destination);
    } catch (fallbackError) {
      console.error('Fallback distance calculation also failed:', fallbackError.message);
      throw new Error('Unable to calculate distance');
    }
  }
};

/**
 * Simple distance calculation using Haversine formula (fallback)
 * @param {Object} origin - Origin coordinates {latitude, longitude}
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @returns {number} - Distance in meters
 */
const calculateDistanceSimple = (origin, destination) => {
  const R = 6371; // Radius of the Earth in kilometers

  const lat1Rad = (origin.latitude * Math.PI) / 180;
  const lat2Rad = (destination.latitude * Math.PI) / 180;
  const deltaLatRad = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const deltaLngRad = ((destination.longitude - origin.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) *
      Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = R * c;
  return distanceKm * 1000; // Convert to meters
};

module.exports = {
  calculateDistance,
  calculateDistanceSimple
};
