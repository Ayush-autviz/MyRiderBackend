/**
 * @swagger
 * components:
 *   schemas:
 *     Ride:
 *       type: object
 *       required:
 *         - customer
 *         - pickupLocation
 *         - destination
 *         - vehicle
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the ride
 *         customer:
 *           type: string
 *           description: Reference to the customer who booked the ride
 *         driver:
 *           type: string
 *           description: Reference to the driver assigned to the ride
 *         pickupLocation:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               description: Pickup location address
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: Pickup location coordinates [longitude, latitude]
 *         destination:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               description: Destination address
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: Destination coordinates [longitude, latitude]
 *         vehicle:
 *           type: string
 *           description: Reference to the vehicle type
 *         status:
 *           type: string
 *           enum: [pending, searchingDriver, accepted, arrived, otp_verified, in_progress, completed, cancelled, noDriversFound]
 *           description: Current status of the ride
 *         rideOtp:
 *           type: string
 *           description: OTP for ride verification (generated when driver arrives at pickup location)
 *         fare:
 *           type: number
 *           description: Fare amount for the ride
 *         distance:
 *           type: number
 *           description: Distance of the ride in kilometers
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the ride was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the ride was last updated
 *       example:
 *         _id: "60d0fe4f5311236168a109cd"
 *         customer: "60d0fe4f5311236168a109ca"
 *         driver: "60d0fe4f5311236168a109cb"
 *         pickupLocation:
 *           address: "123 Main St, City"
 *           coordinates: [77.5946, 12.9716]
 *         destination:
 *           address: "456 Park Ave, City"
 *           coordinates: [77.6146, 12.9816]
 *         vehicle: "60d0fe4f5311236168a109cc"
 *         status: "searchingDriver"
 *         fare: 150
 *         distance: 5.2
 *         createdAt: "2023-05-01T10:30:00Z"
 *         updatedAt: "2023-05-01T10:30:00Z"
 *
 *     RideCreateRequest:
 *       type: object
 *       required:
 *         - pickupLocation
 *         - destination
 *         - vehicleId
 *       properties:
 *         pickupLocation:
 *           type: object
 *           required:
 *             - address
 *             - coordinates
 *           properties:
 *             address:
 *               type: string
 *               description: Pickup location address
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: Pickup location coordinates [longitude, latitude]
 *         destination:
 *           type: object
 *           required:
 *             - address
 *             - coordinates
 *           properties:
 *             address:
 *               type: string
 *               description: Destination address
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: Destination coordinates [longitude, latitude]
 *         vehicleId:
 *           type: string
 *           description: ID of the selected vehicle type
 *       example:
 *         pickupLocation:
 *           address: "123 Main St, City"
 *           coordinates: [77.5946, 12.9716]
 *         destination:
 *           address: "456 Park Ave, City"
 *           coordinates: [77.6146, 12.9816]
 *         vehicleId: "60d0fe4f5311236168a109cc"
 *
 *     RideResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         message:
 *           type: string
 *           description: Message describing the result
 *         data:
 *           type: object
 *           properties:
 *             ride:
 *               $ref: '#/components/schemas/Ride'
 *       example:
 *         success: true
 *         message: "Ride created successfully"
 *         data:
 *           ride:
 *             id: "60d0fe4f5311236168a109cd"
 *             pickupLocation:
 *               address: "123 Main St, City"
 *               coordinates: [77.5946, 12.9716]
 *             destination:
 *               address: "456 Park Ave, City"
 *               coordinates: [77.6146, 12.9816]
 *             vehicle:
 *               _id: "60d0fe4f5311236168a109cc"
 *               type: "Economy"
 *               pricePerKm: 10.5
 *             distance: 5.2
 *             status: "searchingDriver"
 *             createdAt: "2023-05-01T10:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Ride
 *   description: Ride management endpoints
 */

/**
 * @swagger
 * /ride/create:
 *   post:
 *     summary: Create a new ride
 *     tags: [Ride]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RideCreateRequest'
 *     responses:
 *       201:
 *         description: Ride created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RideResponse'
 *       400:
 *         description: Invalid input or insufficient wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Insufficient wallet balance. Required: $25.50, Available: $15.00"
 *                 data:
 *                   type: object
 *                   properties:
 *                     requiredAmount:
 *                       type: number
 *                       example: 25.50
 *                     availableBalance:
 *                       type: number
 *                       example: 15.00
 *                     shortfall:
 *                       type: number
 *                       example: 10.50
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride/{rideId}:
 *   get:
 *     summary: Get ride by ID
 *     tags: [Ride]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride to retrieve
 *     responses:
 *       200:
 *         description: Ride details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ride:
 *                       $ref: '#/components/schemas/Ride'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - ride does not belong to user
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ride:
 *   get:
 *     summary: Get user's ride history
 *     tags: [Ride]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's ride history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rides:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ride'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
