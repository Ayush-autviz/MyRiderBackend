const fcmService = require('./services/fcmService');

// Test script to verify FCM notification with custom sound
async function testCustomSoundNotification() {
  console.log('=== Testing FCM Notification with Custom Sound ===\n');

  // Test FCM token (replace with actual token for testing)
  const testFcmToken = process.env.TEST_FCM_TOKEN || 'your-test-fcm-token-here';

  if (testFcmToken === 'your-test-fcm-token-here') {
    console.log('⚠️  Please set TEST_FCM_TOKEN environment variable or update the token in this script');
    console.log('Example: export TEST_FCM_TOKEN="your-actual-fcm-token"');
    return;
  }

  try {
    console.log('📱 Testing ride request notification with mytone sound...');
    console.log('📱 FCM Token:', testFcmToken.substring(0, 20) + '...');

    const notification = {
      title: 'New Ride Request (Test)',
      body: 'You have a new ride request from Test Customer - This uses mytone sound'
    };

    const data = {
      type: 'ride_requested',
      test: 'true',
      sound: 'mytone',
      timestamp: new Date().toISOString()
    };

    const result = await fcmService.sendToToken(testFcmToken, notification, data);

    if (result.success) {
      console.log('✅ Test notification sent successfully!');
      console.log('📝 Message ID:', result.messageId);
      console.log('🔊 Custom sound "mytone" should play on the device');
    } else {
      console.log('❌ Failed to send test notification');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }

  console.log('\n=== Test Complete ===');
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCustomSoundNotification();
}

module.exports = { testCustomSoundNotification };
