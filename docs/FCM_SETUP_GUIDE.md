# FCM (Firebase Cloud Messaging) Setup Guide

This guide will help you set up Firebase Cloud Messaging for push notifications in your MyRider Backend project.

## Prerequisites

1. A Firebase project
2. Firebase Admin SDK service account key
3. Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "myrider-app")
4. Follow the setup wizard

## Step 2: Generate Service Account Key

1. In your Firebase project, go to **Project Settings** (gear icon)
2. Click on the **Service Accounts** tab
3. Click **Generate new private key**
4. Download the JSON file and keep it secure

## Step 3: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Firebase Cloud Messaging (FCM) Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com
```

**Important Notes:**
- Replace all placeholder values with actual values from your service account JSON
- The `FIREBASE_PRIVATE_KEY` should include the `\n` characters for line breaks
- Keep your private key secure and never commit it to version control

## Step 4: Install Dependencies

The required dependencies are already included in your `package.json`:

```json
{
  "firebase-admin": "^13.3.0"
}
```

If you need to install it manually:

```bash
npm install firebase-admin
```

## Step 5: Test FCM Setup

You can test your FCM setup using the test endpoint:

```bash
curl -X POST http://localhost:4000/fcm/test \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "your-test-fcm-token"
  }'
```

## API Endpoints

### Update FCM Token (User/Driver)
- **POST** `/fcm/update-token` - Update FCM token for authenticated user
- **POST** `/fcm/driver/update-token` - Update FCM token for authenticated driver

### Send Notifications (Admin Only)
- **POST** `/fcm/send-to-user` - Send notification to specific user
- **POST** `/fcm/send-to-multiple` - Send notification to multiple users
- **POST** `/fcm/send-to-all` - Send notification to all users of a type
- **POST** `/fcm/send-ride-notification` - Send ride-related notification

### Test
- **POST** `/fcm/test` - Test FCM functionality

## Automatic Notifications

The system automatically sends FCM notifications for:

1. **Ride Requested** - When a customer requests a ride, nearby drivers get notified
2. **Ride Accepted** - When a driver accepts a ride, the customer gets notified
3. **Driver Arrived** - When driver arrives at pickup location, customer gets notified
4. **Ride Completed** - When ride is completed, both customer and driver get notified

## Client-Side Integration

### Android (Kotlin/Java)

```kotlin
// Get FCM token
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (!task.isSuccessful) {
        Log.w(TAG, "Fetching FCM registration token failed", task.exception)
        return@addOnCompleteListener
    }

    // Get new FCM registration token
    val token = task.result
    Log.d(TAG, "FCM Token: $token")
    
    // Send token to your backend
    sendTokenToServer(token)
}
```

### iOS (Swift)

```swift
// Get FCM token
Messaging.messaging().token { token, error in
    if let error = error {
        print("Error fetching FCM registration token: \(error)")
    } else if let token = token {
        print("FCM registration token: \(token)")
        
        // Send token to your backend
        sendTokenToServer(token: token)
    }
}
```

### React Native

```javascript
import messaging from '@react-native-firebase/messaging';

// Get FCM token
const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    // Send token to your backend
    await sendTokenToServer(token);
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};
```

## Troubleshooting

### Common Issues

1. **"Firebase Admin SDK not initialized"**
   - Check your environment variables
   - Ensure all required FCM environment variables are set

2. **"Invalid private key"**
   - Make sure the private key includes `\n` characters
   - Check that the key is properly formatted

3. **"Project not found"**
   - Verify your `FIREBASE_PROJECT_ID` is correct
   - Ensure the service account has access to the project

4. **"Invalid FCM token"**
   - FCM tokens can expire or become invalid
   - Implement token refresh logic in your client apps

### Testing

Use the test endpoint to verify your setup:

```bash
# Test with a valid FCM token
curl -X POST http://localhost:4000/fcm/test \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "dQw4w9WgXcQ:APA91bF..."
  }'
```

## Security Considerations

1. **Never commit service account keys to version control**
2. **Use environment variables for all sensitive data**
3. **Implement proper authentication for admin endpoints**
4. **Validate FCM tokens on the client side**
5. **Implement rate limiting for notification endpoints**

## Monitoring

Monitor your FCM usage in the Firebase Console:
1. Go to **Cloud Messaging** in your Firebase project
2. Check the **Reports** tab for delivery statistics
3. Monitor the **Diagnostics** tab for any issues

## Support

For more information, refer to:
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [FCM REST API Documentation](https://firebase.google.com/docs/cloud-messaging/http-server-ref)




