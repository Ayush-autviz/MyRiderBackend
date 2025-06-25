/**
 * @swagger
 * components:
 *   schemas:
 *     AdminEarning:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the earning record
 *           example: "64f5f3b3e8c1a2b3c4d5e6f7"
 *         ride:
 *           type: string
 *           description: Reference to the ride
 *           example: "64f5f3b3e8c1a2b3c4d5e6f8"
 *         customer:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f5f3b3e8c1a2b3c4d5e6f9"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *             phone:
 *               type: string
 *               example: "+1234567890"
 *         driver:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f5f3b3e8c1a2b3c4d5e6fa"
 *             name:
 *               type: string
 *               example: "Jane Smith"
 *             email:
 *               type: string
 *               example: "jane@example.com"
 *             phone:
 *               type: string
 *               example: "+0987654321"
 *         totalFare:
 *           type: number
 *           description: Total fare collected from the customer
 *           example: 25.50
 *         commissionAmount:
 *           type: number
 *           description: Commission amount earned by admin
 *           example: 5.10
 *         commissionPercentage:
 *           type: number
 *           description: Commission percentage applied
 *           example: 20
 *         driverEarning:
 *           type: number
 *           description: Amount earned by the driver
 *           example: 20.40
 *         vehicleType:
 *           type: string
 *           description: Type of vehicle used for the ride
 *           example: "car"
 *         pickupLocation:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               example: "123 Main St, City"
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-74.006, 40.7128]
 *         destination:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               example: "456 Oak Ave, City"
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [-74.0059, 40.7127]
 *         rideDistance:
 *           type: number
 *           description: Distance of the ride in kilometers
 *           example: 5.2
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the ride was completed
 *           example: "2024-01-15T14:30:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T14:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T14:30:00.000Z"
 *     
 *     EarningsSummary:
 *       type: object
 *       properties:
 *         totalCommission:
 *           type: number
 *           description: Total commission earned
 *           example: 1500.50
 *         totalRides:
 *           type: number
 *           description: Total number of completed rides
 *           example: 150
 *         averageCommission:
 *           type: number
 *           description: Average commission per ride
 *           example: 10.00
 *         totalFareAmount:
 *           type: number
 *           description: Total fare amount collected
 *           example: 7527.50
 *         averageFare:
 *           type: number
 *           description: Average fare per ride
 *           example: 50.18
 *     
 *     DailyEarning:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Date in YYYY-MM-DD format
 *           example: "2024-01-31"
 *         earnings:
 *           type: number
 *           description: Total earnings for the day
 *           example: 45.20
 *         ridesCount:
 *           type: number
 *           description: Number of rides completed on this day
 *           example: 4
 *         averageFare:
 *           type: number
 *           description: Average fare for rides on this day
 *           example: 56.50
 *         averageCommission:
 *           type: number
 *           description: Average commission for rides on this day
 *           example: 11.30
 *     
 *     MonthlyEarning:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           description: Month in YYYY-MM format
 *           example: "2024-01"
 *         earnings:
 *           type: number
 *           description: Total earnings for the month
 *           example: 1350.80
 *         ridesCount:
 *           type: number
 *           description: Number of rides completed in this month
 *           example: 120
 *         averageFare:
 *           type: number
 *           description: Average fare for rides in this month
 *           example: 56.28
 *         averageCommission:
 *           type: number
 *           description: Average commission for rides in this month
 *           example: 11.26
 *     
 *     VehicleTypeEarning:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Vehicle type
 *           example: "car"
 *         totalCommission:
 *           type: number
 *           description: Total commission for this vehicle type
 *           example: 980.50
 *         totalRides:
 *           type: number
 *           description: Total rides for this vehicle type
 *           example: 85
 *         totalFareAmount:
 *           type: number
 *           description: Total fare amount for this vehicle type
 *           example: 4902.50
 *         averageCommission:
 *           type: number
 *           description: Average commission per ride
 *           example: 11.54
 *         averageFare:
 *           type: number
 *           description: Average fare per ride
 *           example: 57.68
 *         averageDistance:
 *           type: number
 *           description: Average distance per ride
 *           example: 8.2
 *     
 *     EarningsDateRangeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Earnings retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             earnings:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminEarning'
 *             pagination:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 8
 *                 totalCount:
 *                   type: integer
 *                   example: 150
 *                 limit:
 *                   type: integer
 *                   example: 20
 *             summary:
 *               $ref: '#/components/schemas/EarningsSummary'
 *             dateRange:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-31T23:59:59.999Z"
 * 
 * tags:
 *   name: Admin Earnings
 *   description: Admin earnings management and analytics
 */

/**
 * @swagger
 * /admin/earnings/total:
 *   get:
 *     summary: Get total admin earnings summary
 *     description: Retrieve the total commission earned, number of completed rides, and average commission per ride
 *     tags: [Admin Earnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total earnings retrieved successfully
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
 *                   example: "Total earnings retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/EarningsSummary'
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
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
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
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
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /admin/earnings/date-range:
 *   get:
 *     summary: Get admin earnings by date range
 *     description: Retrieve paginated admin earnings for a specific date range with summary statistics
 *     tags: [Admin Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Earnings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EarningsDateRangeResponse'
 *       400:
 *         description: Bad request - Invalid date range or parameters
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
 *                   example: "Start date and end date are required"
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/earnings/daily-summary:
 *   get:
 *     summary: Get daily earnings summary
 *     description: Retrieve daily earnings breakdown for the specified number of days
 *     tags: [Admin Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 365
 *         description: Number of days to fetch (1-365)
 *         example: 30
 *     responses:
 *       200:
 *         description: Daily earnings summary retrieved successfully
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
 *                   example: "Daily earnings summary retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DailyEarning'
 *                     period:
 *                       type: string
 *                       example: "Last 30 days"
 *       400:
 *         description: Bad request - Invalid days parameter
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/earnings/monthly-summary:
 *   get:
 *     summary: Get monthly earnings summary
 *     description: Retrieve monthly earnings breakdown for the specified number of months
 *     tags: [Admin Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 1
 *           maximum: 24
 *         description: Number of months to fetch (1-24)
 *         example: 12
 *     responses:
 *       200:
 *         description: Monthly earnings summary retrieved successfully
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
 *                   example: "Monthly earnings summary retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MonthlyEarning'
 *                     period:
 *                       type: string
 *                       example: "Last 12 months"
 *       400:
 *         description: Bad request - Invalid months parameter
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/earnings/by-vehicle-type:
 *   get:
 *     summary: Get earnings breakdown by vehicle type
 *     description: Retrieve earnings statistics grouped by vehicle type, optionally filtered by date range
 *     tags: [Admin Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD) - optional
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD) - optional
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Earnings by vehicle type retrieved successfully
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
 *                   example: "Earnings by vehicle type retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VehicleTypeEarning'
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/earnings/{earningId}:
 *   get:
 *     summary: Get detailed information about a specific earning record
 *     description: Retrieve complete details of a single admin earning record including customer, driver, and ride information
 *     tags: [Admin Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: earningId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin earning record ID
 *         example: "64f5f3b3e8c1a2b3c4d5e6f7"
 *     responses:
 *       200:
 *         description: Earning details retrieved successfully
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
 *                   example: "Earning details retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminEarning'
 *       404:
 *         description: Earning record not found
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
 *                   example: "Earning record not found"
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       500:
 *         description: Internal server error
 */

module.exports = {}; 