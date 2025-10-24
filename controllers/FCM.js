const fcmService = require('../services/fcmService');
const User = require('../models/User');
const Driver = require('../models/Driver');

/**
 * Update FCM token for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;
    const userType = req.user.role;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    let user;
    if (userType === 'customer') {
      user = await User.findByIdAndUpdate(
        userId,
        { fcmToken },
        { new: true }
      );
    } else if (userType === 'driver') {
      user = await Driver.findByIdAndUpdate(
        userId,
        { fcmToken },
        { new: true }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'FCM token updated successfully',
      data: { fcmToken: user.fcmToken }
    });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Send notification to a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, userType, title, body, data, imageUrl } = req.body;

    if (!userId || !userType || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userId, userType, title, and body are required'
      });
    }

    const notification = { title, body, imageUrl };
    const result = await fcmService.sendToUser(userId, userType, notification, data);

    res.json({
      success: result.success,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
      data: result
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Send notification to multiple users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendNotificationToMultipleUsers = async (req, res) => {
  try {
    const { fcmTokens, title, body, data, imageUrl } = req.body;

    if (!fcmTokens || !Array.isArray(fcmTokens) || fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'fcmTokens array is required'
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'title and body are required'
      });
    }

    const notification = { title, body, imageUrl };
    const result = await fcmService.sendToMultipleTokens(fcmTokens, notification, data);

    res.json({
      success: result.success,
      message: result.success ? 'Notifications sent successfully' : 'Failed to send notifications',
      data: result
    });
  } catch (error) {
    console.error('Error sending notifications to multiple users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Send notification to all users of a specific type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { userType, title, body, data, imageUrl } = req.body;

    if (!userType || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userType, title, and body are required'
      });
    }

    if (!['user', 'driver'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'userType must be "user" or "driver"'
      });
    }

    const notification = { title, body, imageUrl };
    const result = await fcmService.sendToAllUsers(userType, notification, data);

    res.json({
      success: result.success,
      message: result.success ? 'Notifications sent successfully' : 'Failed to send notifications',
      data: result
    });
  } catch (error) {
    console.error('Error sending notifications to all users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Send ride-related notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendRideNotification = async (req, res) => {
  try {
    const { rideId, type, additionalData } = req.body;

    if (!rideId || !type) {
      return res.status(400).json({
        success: false,
        message: 'rideId and type are required'
      });
    }

    const result = await fcmService.sendRideNotification(rideId, type, additionalData);

    res.json({
      success: result.success,
      message: result.success ? 'Ride notification sent successfully' : 'Failed to send ride notification',
      data: result
    });
  } catch (error) {
    console.error('Error sending ride notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Test FCM functionality
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testFCM = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required for testing'
      });
    }

    const notification = {
      title: 'New Ride Request (Test)',
      body: `You have a new ride request from Test Customer - This notification uses mytone sound`,
    };

    const data = {
      type: 'ride_requested',
      timestamp: new Date().toISOString(),
      test: 'true',
      sound: 'mytone'
    };

    const result = await fcmService.sendToToken(fcmToken, notification, data);

    res.json({
      success: result.success,
      message: result.success ? 'Test notification sent successfully' : 'Failed to send test notification',
      data: result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Debug Firebase configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const debugFirebaseConfig = async (req, res) => {
  try {
    const config = fcmService.debugFirebaseConfig();
    
    res.json({
      success: true,
      message: 'Firebase configuration debug info',
      data: config
    });
  } catch (error) {
    console.error('Error debugging Firebase config:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  updateFCMToken,
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  sendNotificationToAllUsers,
  sendRideNotification,
  testFCM,
  debugFirebaseConfig
};


