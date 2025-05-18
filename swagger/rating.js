/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value between 1 and 5
 *         review:
 *           type: string
 *           description: Optional review comment
 *       example:
 *         rating: 4.5
 *         review: "Great service, very professional driver"
 *
 *     RatingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           properties:
 *             ride:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Ride ID
 *                 rating:
 *                   type: number
 *                   description: Rating value
 *                 review:
 *                   type: string
 *                   description: Review comment
 *       example:
 *         success: true
 *         message: "Ride and driver rated successfully"
 *         data:
 *           ride:
 *             id: "60d0fe4f5311236168a109cd"
 *             rating: 4.5
 *             review: "Great service, very professional driver"
 *
 *     DriverRatingsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         data:
 *           type: object
 *           properties:
 *             averageRating:
 *               type: number
 *               description: Driver's average rating
 *             totalRatings:
 *               type: number
 *               description: Total number of ratings received
 *             totalRides:
 *               type: number
 *               description: Total number of rides completed
 *             ratings:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: User ID
 *                       firstName:
 *                         type: string
 *                         description: User's first name
 *                       lastName:
 *                         type: string
 *                         description: User's last name
 *                   rating:
 *                     type: number
 *                     description: Rating value
 *                   comment:
 *                     type: string
 *                     description: Review comment
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Date when the rating was submitted
 *       example:
 *         success: true
 *         data:
 *           averageRating: 4.2
 *           totalRatings: 15
 *           totalRides: 20
 *           ratings:
 *             - user:
 *                 _id: "60d0fe4f5311236168a109ca"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *               rating: 4
 *               comment: "Great service"
 *               date: "2023-05-01T10:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Rating
 *   description: Rating management endpoints
 */

/**
 * @swagger
 * /rating/ride/{rideId}:
 *   post:
 *     summary: Rate a completed ride and the driver
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ride to rate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       200:
 *         description: Ride and driver rated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RatingResponse'
 *       400:
 *         description: Invalid input or ride already rated
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
 * /rating/driver/{driverId}:
 *   get:
 *     summary: Get driver ratings
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the driver
 *     responses:
 *       200:
 *         description: Driver ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverRatingsResponse'
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */
