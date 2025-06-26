/**
 * Helper function to normalize coordinates for consistent distance calculation
 * Handles both coordinate formats used in the application:
 * - Direct format: { latitude: number, longitude: number }
 * - GeoJSON format: { coordinates: [longitude, latitude] }
 * 
 * @param {Object} coords - Coordinate object in either format
 * @returns {Object} Normalized coordinates with latitude and longitude properties
 * @throws {Error} If coordinate format is invalid
 */
const normalizeCoordinates = (coords) => {
  // Handle GeoJSON format: coordinates[0] = longitude, coordinates[1] = latitude
  if (coords.coordinates && Array.isArray(coords.coordinates)) {
    if (coords.coordinates.length < 2) {
      throw new Error('GeoJSON coordinates array must have at least 2 elements [longitude, latitude]');
    }
    return {
      latitude: coords.coordinates[1],
      longitude: coords.coordinates[0]
    };
  } 
  // Handle direct format: { latitude, longitude }
  else if (coords.latitude !== undefined && coords.longitude !== undefined) {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
  } 
  else {
    throw new Error('Invalid coordinate format. Expected { latitude, longitude } or { coordinates: [longitude, latitude] }');
  }
};

/**
 * Validates if coordinates are within valid ranges
 * @param {Object} normalizedCoords - Coordinates with latitude and longitude properties
 * @returns {boolean} True if coordinates are valid
 */
const validateCoordinates = (normalizedCoords) => {
  const { latitude, longitude } = normalizedCoords;
  
  // Check if latitude is between -90 and 90
  if (latitude < -90 || latitude > 90) {
    return false;
  }
  
  // Check if longitude is between -180 and 180
  if (longitude < -180 || longitude > 180) {
    return false;
  }
  
  return true;
};

module.exports = {
  normalizeCoordinates,
  validateCoordinates
}; 