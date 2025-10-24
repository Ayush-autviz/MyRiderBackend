/**
 * @swagger
 * tags:
 *   name: FCM
 *   description: Firebase Cloud Messaging (Push Notifications) API
 */

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
 *           example: "dQw4w9WgXcQ:APA91bF..."
 *     NotificationPayload:
 *       type: object
 *       required:
 *         - title
 *         - body
 *       properties:
 *         title:
 *           type: string
 *           description: Notification title
 *           example: "New Ride Request"
 *         body:
 *           type: string
 *           description: Notification body
 *           example: "You have a new ride request from John Doe"
 *         imageUrl:
 *           type: string
 *           description: Optional image URL
 *           example: "https://example.com/image.jpg"
 *         data:
 *           type: object
 *           description: Additional data payload
 *           example: { "rideId": "60f7b3b3b3b3b3b3b3b3b3b3", "type": "ride_requested" }
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
 *               example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *             userType:
 *               type: string
 *               enum: [user, driver]
 *               description: Type of user
 *               example: "user"
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
 *               example: ["dQw4w9WgXcQ:APA91bF...", "eRr5x0XhYdR:APA91bF..."]
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
 *               example: "user"
 *     RideNotification:
 *       type: object
 *       required:
 *         - rideId
 *         - type
 *       properties:
 *         rideId:
 *           type: string
 *           description: Ride ID
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         type:
 *           type: string
 *           enum: [ride_requested, ride_accepted, ride_started, ride_completed, ride_cancelled, driver_arrived]
 *           description: Type of ride notification
 *           example: "ride_requested"
 *         additionalData:
 *           type: object
 *           description: Additional data for the notification
 *           example: { "driverName": "John Doe", "estimatedTime": "5 minutes" }
 *     FCMResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           description: Additional response data
 *     FCMErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "FCM token is required"
 */

/**
 * @swagger
 * /fcm/update-token:
 *   post:
 *     summary: Update FCM token for authenticated user
 *     description: Allows authenticated users (customers and drivers) to update their FCM token for receiving push notifications
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FCMTokenUpdate'
 *           examples:
 *             customer:
 *               summary: Customer updating FCM token
 *               value:
 *                 fcmToken: "dQw4w9WgXcQ:APA91bF..."
 *             driver:
 *               summary: Driver updating FCM token
 *               value:
 *                 fcmToken: "eRr5x0XhYdR:APA91bF..."
 *     responses:
 *       200:
 *         description: FCM token updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/FCMResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         fcmToken:
 *                           type: string
 *                           example: "dQw4w9WgXcQ:APA91bF..."
 *             examples:
 *               success:
 *                 summary: Successful token update
 *                 value:
 *                   success: true
 *                   message: "FCM token updated successfully"
 *                   data:
 *                     fcmToken: "dQw4w9WgXcQ:APA91bF..."
 *       400:
 *         description: Bad request - Missing or invalid FCM token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *             examples:
 *               missing_token:
 *                 summary: Missing FCM token
 *                 value:
 *                   success: false
 *                   message: "FCM token is required"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 */

/**
 * @swagger
 * /fcm/test:
 *   post:
 *     summary: Test FCM functionality
 *     description: Send a test notification to verify FCM setup and configuration
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
 *                 example: "dQw4w9WgXcQ:APA91bF..."
 *           examples:
 *             test_token:
 *               summary: Test with FCM token
 *               value:
 *                 fcmToken: "dQw4w9WgXcQ:APA91bF..."
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMResponse'
 *             examples:
 *               success:
 *                 summary: Test notification sent
 *                 value:
 *                   success: true
 *                   message: "Test notification sent successfully"
 *                   data:
 *                     success: true
 *                     messageId: "projects/myproject/messages/1234567890"
 *       400:
 *         description: Bad request - Missing FCM token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 */

/**
 * @swagger
 * /fcm/send-to-user:
 *   post:
 *     summary: Send notification to a specific user (Admin only)
 *     description: Allows admin users to send push notifications to specific users or drivers
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserNotification'
 *           examples:
 *             user_notification:
 *               summary: Send notification to user
 *               value:
 *                 userId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 userType: "user"
 *                 title: "Welcome to MyRider"
 *                 body: "Thank you for joining MyRider! Start your first ride today."
 *                 data:
 *                   type: "welcome"
 *                   action: "open_app"
 *             driver_notification:
 *               summary: Send notification to driver
 *               value:
 *                 userId: "60f7b3b3b3b3b3b3b3b3b3b4"
 *                 userType: "driver"
 *                 title: "New Ride Available"
 *                 body: "A new ride request is available in your area"
 *                 data:
 *                   type: "ride_request"
 *                   rideId: "60f7b3b3b3b3b3b3b3b3b3b5"
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMResponse'
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 */

/**
 * @swagger
 * /fcm/send-to-multiple:
 *   post:
 *     summary: Send notification to multiple users (Admin only)
 *     description: Allows admin users to send push notifications to multiple users using their FCM tokens
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MultipleUsersNotification'
 *           examples:
 *             bulk_notification:
 *               summary: Send notification to multiple users
 *               value:
 *                 fcmTokens: 
 *                   - "dQw4w9WgXcQ:APA91bF..."
 *                   - "eRr5x0XhYdR:APA91bF..."
 *                   - "fSs6y1YiZeS:APA91bF..."
 *                 title: "System Maintenance"
 *                 body: "The app will be under maintenance from 2 AM to 4 AM"
 *                 data:
 *                   type: "maintenance"
 *                   startTime: "2024-01-15T02:00:00Z"
 *                   endTime: "2024-01-15T04:00:00Z"
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/FCMResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         successCount:
 *                           type: number
 *                           example: 2
 *                         failureCount:
 *                           type: number
 *                           example: 1
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 */

/**
 * @swagger
 * /fcm/send-to-all:
 *   post:
 *     summary: Send notification to all users of a specific type (Admin only)
 *     description: Allows admin users to send push notifications to all users or all drivers
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AllUsersNotification'
 *           examples:
 *             all_users:
 *               summary: Send notification to all users
 *               value:
 *                 userType: "user"
 *                 title: "New Feature Available"
 *                 body: "Check out our new ride sharing feature!"
 *                 data:
 *                   type: "feature_update"
 *                   feature: "ride_sharing"
 *             all_drivers:
 *               summary: Send notification to all drivers
 *               value:
 *                 userType: "driver"
 *                 title: "Updated Commission Rates"
 *                 body: "Commission rates have been updated. Check your dashboard for details."
 *                 data:
 *                   type: "commission_update"
 *                   newRate: "15%"
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMResponse'
 *       400:
 *         description: Bad request - Missing required fields or invalid user type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 */

/**
 * @swagger
 * /fcm/send-ride-notification:
 *   post:
 *     summary: Send ride-related notification (Admin only)
 *     description: Allows admin users to send ride-specific notifications (ride requested, accepted, started, etc.)
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RideNotification'
 *           examples:
 *             ride_requested:
 *               summary: Ride requested notification
 *               value:
 *                 rideId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 type: "ride_requested"
 *                 additionalData:
 *                   passengerName: "John Doe"
 *                   pickupLocation: "123 Main St"
 *             ride_accepted:
 *               summary: Ride accepted notification
 *               value:
 *                 rideId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 type: "ride_accepted"
 *                 additionalData:
 *                   driverName: "Jane Smith"
 *                   estimatedArrival: "5 minutes"
 *             ride_completed:
 *               summary: Ride completed notification
 *               value:
 *                 rideId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                 type: "ride_completed"
 *                 additionalData:
 *                   fare: 25.50
 *                   rating: 5
 *     responses:
 *       200:
 *         description: Ride notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMResponse'
 *       400:
 *         description: Bad request - Missing required fields or invalid notification type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FCMErrorResponse'
 */





