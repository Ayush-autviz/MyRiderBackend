/**
 * @swagger
 * components:
 *   securitySchemes:
 *     AdminBearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AdminLoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Admin username or email
 *         password:
 *           type: string
 *           description: Admin password
 *     AdminLoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             admin:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 role:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *     DashboardStats:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 active:
 *                   type: number
 *             drivers:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 active:
 *                   type: number
 *                 pending:
 *                   type: number
 *             rides:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 completed:
 *                   type: number
 *                 today:
 *                   type: number
 *             revenue:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *     UsersList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *     DriversList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             drivers:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Driver'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *     RidesList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             rides:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ride'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: number
 *         totalPages:
 *           type: number
 *         totalUsers:
 *           type: number
 *         hasNextPage:
 *           type: boolean
 *         hasPrevPage:
 *           type: boolean
 *     AnalyticsData:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             period:
 *               type: string
 *             rides:
 *               type: object
 *             revenue:
 *               type: object
 *             userGrowth:
 *               type: array
 *             driverGrowth:
 *               type: array
 *             ridesByStatus:
 *               type: array
 *             topDrivers:
 *               type: array
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated
 */

/**
 * @swagger
 * /admin/refresh-token:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - AdminBearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Admin Analytics]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 7d
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsData'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Admin User Management]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [0, 1, 2]
 *         description: User status filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersList'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/drivers/{driverId}/approval:
 *   put:
 *     summary: Approve or reject driver application
 *     tags: [Admin Driver Management]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Approval action
 *               reason:
 *                 type: string
 *                 description: Rejection reason (optional)
 *     responses:
 *       200:
 *         description: Driver approval updated successfully
 *       400:
 *         description: Invalid action or driver not pending approval
 *       404:
 *         description: Driver not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/rides:
 *   get:
 *     summary: Get all rides with pagination and filters
 *     tags: [Admin Ride Management]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of rides per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Ride status filter
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter rides from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter rides to this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Rides retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RidesList'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/rides/{rideId}/cancel:
 *   put:
 *     summary: Cancel a ride (admin override)
 *     tags: [Admin Ride Management]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ride ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Cancellation reason
 *                 default: "Cancelled by admin"
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 *       400:
 *         description: Cannot cancel completed or already cancelled ride
 *       404:
 *         description: Ride not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */