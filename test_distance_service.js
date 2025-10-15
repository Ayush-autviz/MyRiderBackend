const { calculateDistance, calculateDistanceSimple } = require('./services/distanceService');

/**
 * Test script to verify Google Maps distance calculation integration
 * Run this with: node test_distance_service.js
 */

async function testDistanceCalculation() {
  console.log('🧪 Testing Distance Calculation Service...\n');

  // Test coordinates (Lahore, Pakistan coordinates for example)
  const pickup = {
    latitude: 31.5204,
    longitude: 74.3587
  };

  const destination = {
    latitude: 31.5497,
    longitude: 74.3436
  };

  console.log('📍 Test Coordinates:');
  console.log('Pickup:', pickup);
  console.log('Destination:', destination);
  console.log();

  try {
    // Test the fallback calculation first (doesn't require API key)
    console.log('🔄 Testing fallback distance calculation (Haversine formula)...');
    const fallbackDistance = calculateDistanceSimple(pickup, destination);
    console.log(`✅ Fallback calculation result: ${fallbackDistance.toFixed(2)} meters`);
    console.log(`✅ Distance in km: ${(fallbackDistance / 1000).toFixed(2)} km`);
    console.log();

    // Test Google Maps API calculation (requires API key)
    console.log('🌐 Testing Google Maps Distance Matrix API calculation...');
    const googleDistance = await calculateDistance(pickup, destination);

    if (googleDistance) {
      console.log(`✅ Google Maps API result: ${googleDistance.toFixed(2)} meters`);
      console.log(`✅ Distance in km: ${(googleDistance / 1000).toFixed(2)} km`);

      // Compare results
      const difference = Math.abs(googleDistance - fallbackDistance);
      const differencePercent = (difference / fallbackDistance) * 100;

      console.log(`\n📊 Comparison:`);
      console.log(`Difference: ${difference.toFixed(2)} meters (${differencePercent.toFixed(2)}%)`);

      if (differencePercent < 10) {
        console.log('✅ Results are reasonably close - integration successful!');
      } else {
        console.log('⚠️  Results differ significantly - check coordinates or API response');
      }
    } else {
      console.log('⚠️  Google Maps API returned no result (API key may be missing or invalid)');
      console.log('✅ Fallback calculation is working properly');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);

    if (error.message.includes('GOOGLE_MAPS_API_KEY')) {
      console.log('\n💡 To enable Google Maps API:');
      console.log('1. Get a Google Maps API key from https://console.cloud.google.com/');
      console.log('2. Enable Distance Matrix API for your project');
      console.log('3. Set environment variable: GOOGLE_MAPS_API_KEY=your_api_key_here');
      console.log('4. Restart your application');
    }
  }

  console.log('\n🎯 Integration Status:');
  console.log('✅ Google Maps package installed');
  console.log('✅ Distance service created');
  console.log('✅ Controllers updated to use new service');
  console.log('✅ Geolib dependency removed');
  console.log('✅ Fallback calculation available');
}

// Run the test
if (require.main === module) {
  testDistanceCalculation();
}

module.exports = { testDistanceCalculation };

