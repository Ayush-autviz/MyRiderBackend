const express = require('express');
const router = express.Router();
const {
  updateFCMToken,
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  sendNotificationToAllUsers,
  sendRideNotification,
  testFCM
} = require('../controllers/FCM');
const authenticateUser = require('../middlewares/UserAuthentication');
const authenticateDriver = require('../middlewares/DriverAuthentication');
const { authAdmin: authenticateAdmin } = require('../middlewares/AdminAuthentication');

/**
 * @swagger
 * components:
 *   schemas:
 *     FCMTokenUpdate:
 *       type: object
 *       required:
 *         - fcmToken
 *       properties:
 *         fcmToken:
 *           type: string
 *           description: Firebase Cloud Messaging token
 *     NotificationPayload:
 *       type: object
 *       required:
 *         - title
 *         - body
 *       properties:
 *         title:
 *           type: string
 *           description: Notification title
 *         body:
 *           type: string
 *           description: Notification body
 *         imageUrl:
 *           type: string
 *           description: Optional image URL
 *         data:
 *           type: object
 *           description: Additional data payload
 *     UserNotification:
 *       allOf:
 *         - $ref: '#/components/schemas/NotificationPayload'
 *         - type: object
 *           required:
 *             - userId
 *             - userType
 *           properties:
 *             userId:
 *               type: string
 *               description: User ID
 *             userType:
 *               type: string
 *               enum: [user, driver]
 *               description: Type of user
 *     MultipleUsersNotification:
 *       allOf:
 *         - $ref: '#/components/schemas/NotificationPayload'
 *         - type: object
 *           required:
 *             - fcmTokens
 *           properties:
 *             fcmTokens:
 *               type: array
 *               items:
 *                 type: string
 *               description: Array of FCM tokens
 *     AllUsersNotification:
 *       allOf:
 *         - $ref: '#/components/schemas/NotificationPayload'
 *         - type: object
 *           required:
 *             - userType
 *           properties:
 *             userType:
 *               type: string
 *               enum: [user, driver]
 *               description: Type of users to notify
 *     RideNotification:
 *       type: object
 *       required:
 *         - rideId
 *         - type
 *       properties:
 *         rideId:
 *           type: string
 *           description: Ride ID
 *         type:
 *           type: string
 *           enum: [ride_requested, ride_accepted, ride_started, ride_completed, ride_cancelled, driver_arrived]
 *           description: Type of ride notification
 *         additionalData:
 *           type: object
 *           description: Additional data for the notification
 */

/**
 * @swagger
 * /fcm/update-token:
 *   post:
 *     summary: Update FCM token for authenticated user
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FCMTokenUpdate'
 *     responses:
 *       200:
 *         description: FCM token updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     fcmToken:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/update-token', authenticateUser, updateFCMToken);
router.post('/driver/update-token', authenticateDriver, updateFCMToken);

/**
 * @swagger
 * /fcm/test:
 *   post:
 *     summary: Test FCM functionality
 *     tags: [FCM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: FCM token to test
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/test', testFCM);

/**
 * @swagger
 * /fcm/send-to-user:
 *   post:
 *     summary: Send notification to a specific user (Admin only)
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserNotification'
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/send-to-user', authenticateAdmin, sendNotificationToUser);

/**
 * @swagger
 * /fcm/send-to-multiple:
 *   post:
 *     summary: Send notification to multiple users (Admin only)
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MultipleUsersNotification'
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/send-to-multiple', authenticateAdmin, sendNotificationToMultipleUsers);

/**
 * @swagger
 * /fcm/send-to-all:
 *   post:
 *     summary: Send notification to all users of a specific type (Admin only)
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AllUsersNotification'
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/send-to-all', authenticateAdmin, sendNotificationToAllUsers);

/**
 * @swagger
 * /fcm/send-ride-notification:
 *   post:
 *     summary: Send ride-related notification (Admin only)
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RideNotification'
 *     responses:
 *       200:
 *         description: Ride notification sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/send-ride-notification', authenticateAdmin, sendRideNotification);

module.exports = router;


