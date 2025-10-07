const { getMessaging } = require('../config/fcmConfig');
const User = require('../models/User');
const Driver = require('../models/Driver');

class FCMService {
  constructor() {
    this.messaging = getMessaging();
  }

  /**
   * Send notification to a single user by FCM token
   * @param {string} fcmToken - FCM token of the user
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>} - FCM response
   */
  async sendToToken(fcmToken, notification, data = {}) {
    try {
      if (!fcmToken) {
        throw new Error('FCM token is required');
      }

      const message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent message:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending FCM message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users by FCM tokens
   * @param {Array<string>} fcmTokens - Array of FCM tokens
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>} - FCM response
   */
  async sendToMultipleTokens(fcmTokens, notification, data = {}) {
    try {
      if (!fcmTokens || fcmTokens.length === 0) {
        throw new Error('FCM tokens array is required');
      }

      const message = {
        tokens: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined,
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.sendMulticast(message);
      console.log(`Successfully sent message to ${response.successCount} devices`);
      console.log(`Failed to send to ${response.failureCount} devices`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      console.error('Error sending FCM multicast message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to a user by user ID
   * @param {string} userId - User ID
   * @param {string} userType - 'user' or 'driver'
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>} - FCM response
   */
  async sendToUser(userId, userType, notification, data = {}) {
    try {
      let user;
      if (userType === 'user') {
        user = await User.findById(userId);
      } else if (userType === 'driver') {
        user = await Driver.findById(userId);
      } else {
        throw new Error('Invalid user type. Must be "user" or "driver"');
      }

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.fcmToken) {
        throw new Error('User does not have an FCM token');
      }

      return await this.sendToToken(user.fcmToken, notification, data);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to all users of a specific type
   * @param {string} userType - 'user' or 'driver'
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>} - FCM response
   */
  async sendToAllUsers(userType, notification, data = {}) {
    try {
      let users;
      if (userType === 'user') {
        users = await User.find({ fcmToken: { $exists: true, $ne: null } });
      } else if (userType === 'driver') {
        users = await Driver.find({ fcmToken: { $exists: true, $ne: null } });
      } else {
        throw new Error('Invalid user type. Must be "user" or "driver"');
      }

      const fcmTokens = users.map(user => user.fcmToken).filter(token => token);
      
      if (fcmTokens.length === 0) {
        return { success: true, message: 'No users with FCM tokens found' };
      }

      return await this.sendToMultipleTokens(fcmTokens, notification, data);
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send ride-related notifications
   * @param {string} rideId - Ride ID
   * @param {string} type - Notification type
   * @param {Object} additionalData - Additional data
   * @returns {Promise<Object>} - FCM response
   */
  async sendRideNotification(rideId, type, additionalData = {}) {
    try {
      const Ride = require('../models/Ride');
      const ride = await Ride.findById(rideId).populate('user driver');
      
      if (!ride) {
        throw new Error('Ride not found');
      }

      const notifications = {
        ride_requested: {
          title: 'New Ride Request',
          body: `You have a new ride request from ${ride.user.firstName}`,
          data: { rideId, type: 'ride_requested', ...additionalData }
        },
        ride_accepted: {
          title: 'Ride Accepted',
          body: `Your ride has been accepted by ${ride.driver.firstName}`,
          data: { rideId, type: 'ride_accepted', ...additionalData }
        },
        ride_started: {
          title: 'Ride Started',
          body: 'Your ride has started',
          data: { rideId, type: 'ride_started', ...additionalData }
        },
        ride_completed: {
          title: 'Ride Completed',
          body: 'Your ride has been completed',
          data: { rideId, type: 'ride_completed', ...additionalData }
        },
        ride_cancelled: {
          title: 'Ride Cancelled',
          body: 'Your ride has been cancelled',
          data: { rideId, type: 'ride_cancelled', ...additionalData }
        },
        driver_arrived: {
          title: 'Driver Arrived',
          body: 'Your driver has arrived',
          data: { rideId, type: 'driver_arrived', ...additionalData }
        }
      };

      const notification = notifications[type];
      if (!notification) {
        throw new Error('Invalid notification type');
      }

      // Send to user
      if (ride.user && ride.user.fcmToken) {
        await this.sendToToken(ride.user.fcmToken, notification, notification.data);
      }

      // Send to driver (for certain notification types)
      if (['ride_requested'].includes(type) && ride.driver && ride.driver.fcmToken) {
        await this.sendToToken(ride.driver.fcmToken, notification, notification.data);
      }

      return { success: true, message: 'Ride notification sent successfully' };
    } catch (error) {
      console.error('Error sending ride notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FCMService();

