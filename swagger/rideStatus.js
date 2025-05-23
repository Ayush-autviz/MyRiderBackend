/**
 * @swagger
 * components:
 *   schemas:
 *     RideStatusUpdate:
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
 *           properties:
 *             ride:
 *               $ref: '#/components/schemas/Ride'
 *       example:
 *         success: true
 *         message: "Status updated successfully"
 *         data:
 *           ride:
 *             _id: "60d0fe4f5311236168a109cd"
 *             status: "arrived"
 */

/**
 * @swagger
 * tags:
 *   name: RideStatus
 *   description: Ride status management endpoints
 */

/**
 * @swagger
 * /ride-status/driver/arrived/{rideId}:
 *   put:
 *     summary: Driver has arrived at pickup location
 *     tags: [RideStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideStatusUpdate'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized for this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride-status/driver/waiting/{rideId}:
 *   put:
 *     summary: Driver is waiting for customer and generates ride OTP
 *     tags: [RideStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideStatusUpdate'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized for this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride-status/driver/verify-otp/{rideId}:
 *   put:
 *     summary: Verify ride OTP provided by customer
 *     tags: [RideStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: OTP provided by the customer
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideStatusUpdate'
 *       400:
 *         description: Invalid OTP or status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized for this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride-status/driver/start/{rideId}:
 *   put:
 *     summary: Start the ride (moving to destination)
 *     tags: [RideStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride
 *     responses:
 *       200:
 *         description: Ride started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideStatusUpdate'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized for this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride-status/driver/complete/{rideId}:
 *   put:
 *     summary: Complete the ride
 *     tags: [RideStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride
 *     responses:
 *       200:
 *         description: Ride completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideStatusUpdate'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized for this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride-status/driver/cancel/{rideId}:
 *   put:
 *     summary: Driver cancels the ride
 *     tags: [RideStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideStatusUpdate'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized for this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride-status/customer/cancel/{rideId}:
 *   put:
 *     summary: Customer cancels the ride
 *     tags: [RideStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideStatusUpdate'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not authorized for this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */
