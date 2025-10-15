const { Client } = require('@googlemaps/google-maps-services-js');

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.warn('GOOGLE_MAPS_API_KEY environment variable is not set');
}

const googleMapsClient = new Client({});

module.exports = {
  googleMapsClient
};
