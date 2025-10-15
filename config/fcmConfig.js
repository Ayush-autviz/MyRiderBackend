const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let fcmInitialized = false;

const initializeFCM = () => {
  if (fcmInitialized) {
    return admin.app();
  }

  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Initialize with service account key
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    
    fcmInitialized = true;
    console.log('✓ Firebase Admin SDK initialized successfully');
    return admin.app();
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

// Get FCM messaging instance
const getMessaging = () => {
  const app = initializeFCM();
  return admin.messaging();
};

module.exports = {
  initializeFCM,
  getMessaging,
  admin
};



