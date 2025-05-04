/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       required:
 *         - type
 *         - pricePerKm
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the vehicle type
 *         type:
 *           type: string
 *           enum: [bike, car, carWithExtraDriver, bikeWithExtraDriver]
 *           description: Type of vehicle
 *         pricePerKm:
 *           type: number
 *           description: Price per kilometer for this vehicle type
 *         description:
 *           type: string
 *           description: Detailed description of the vehicle type
 *       example:
 *         id: "car"
 *         type: "car"
 *         pricePerKm: 15
 *         description: "Standard car for up to 4 passengers. Comfortable and spacious for city travel."
 *
 *     PriceEstimate:
 *       type: object
 *       properties:
 *         vehicleId:
 *           type: string
 *           description: ID of the vehicle type
 *         vehicleType:
 *           type: string
 *           description: Type of vehicle
 *         price:
 *           type: string
 *           description: Estimated price for the ride
 *         distance:
 *           type: string
 *           description: Distance in kilometers
 *         description:
 *           type: string
 *           description: Description of the vehicle type
 *       example:
 *         vehicleId: "car"
 *         vehicleType: "car"
 *         price: "150.00"
 *         distance: "10.00"
 *         description: "Standard car for up to 4 passengers. Comfortable and spacious for city travel."
 */

/**
 * @swagger
 * tags:
 *   name: Vehicle
 *   description: Vehicle and ride pricing endpoints
 */

/**
 * @swagger
 * /vehicle:
 *   get:
 *     summary: Get all vehicle types
 *     tags: [Vehicle]
 *     responses:
 *       200:
 *         description: List of all vehicle types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle types retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /vehicle/type/{type}:
 *   get:
 *     summary: Get a vehicle by type
 *     tags: [Vehicle]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [bike, car, carWithExtraDriver, bikeWithExtraDriver]
 *         description: Type of vehicle
 *     responses:
 *       200:
 *         description: Vehicle type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle type retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle type not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /vehicle/{id}:
 *   get:
 *     summary: Get a vehicle type by ID
 *     tags: [Vehicle]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the vehicle type
 *     responses:
 *       200:
 *         description: Vehicle type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle type retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle type not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /vehicle/calculate-prices:
 *   post:
 *     summary: Calculate ride prices for all vehicle types
 *     tags: [Vehicle]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupCoords
 *               - destinationCoords
 *             properties:
 *               pickupCoords:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: Pickup location latitude
 *                   longitude:
 *                     type: number
 *                     description: Pickup location longitude
 *               destinationCoords:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: Destination location latitude
 *                   longitude:
 *                     type: number
 *                     description: Destination location longitude
 *     responses:
 *       200:
 *         description: Price estimates calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Price estimates calculated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     priceEstimates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PriceEstimate'
 *                     totalDistance:
 *                       type: string
 *                       example: "10.00"
 *                       description: Total distance in kilometers
 *       400:
 *         description: Missing required coordinates
 *       500:
 *         description: Server error
 */
