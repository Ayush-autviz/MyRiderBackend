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
 *     CommissionSetting:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         commissionPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Global commission percentage for all rides
 *         description:
 *           type: string
 *           description: Description of the commission setting
 *         isActive:
 *           type: boolean
 *           description: Whether the commission setting is active
 *         lastUpdatedBy:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             username:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AdminWithdrawalRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         driver:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             walletAmount:
 *               type: number
 *         amount:
 *           type: number
 *         requestedAmount:
 *           type: number
 *         bankDetails:
 *           type: object
 *           properties:
 *             accountHolderName:
 *               type: string
 *             accountNumber:
 *               type: string
 *             bankName:
 *               type: string
 *             routingNumber:
 *               type: string
 *             swiftCode:
 *               type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, processed, failed]
 *         adminNotes:
 *           type: string
 *         rejectionReason:
 *           type: string
 *         processedBy:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             username:
 *               type: string
 *         processedAt:
 *           type: string
 *           format: date-time
 *         transactionId:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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

/**
 * @swagger
 * /admin/commission:
 *   get:
 *     summary: Get current commission setting
 *     tags: [Admin Commission Management]
 *     security:
 *       - AdminBearerAuth: []
 *     responses:
 *       200:
 *         description: Commission setting retrieved successfully
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
 *                   $ref: '#/components/schemas/CommissionSetting'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
   put:
 *     summary: Update global commission setting
 *     tags: [Admin Commission Management]
 *     security:
 *       - AdminBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commissionPercentage
 *             properties:
 *               commissionPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Global commission percentage (0-100)
 *               description:
 *                 type: string
 *                 description: Commission description
 *     responses:
 *       200:
 *         description: Commission setting updated successfully
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
 *                   $ref: '#/components/schemas/CommissionSetting'
 *       400:
 *         description: Invalid commission percentage
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/commission/initialize:
 *   post:
 *     summary: Initialize default commission setting (20%)
 *     tags: [Admin Commission Management]
 *     security:
 *       - AdminBearerAuth: []
 *     responses:
 *       200:
 *         description: Default commission setting initialized successfully
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
 *                   $ref: '#/components/schemas/CommissionSetting'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/withdrawals:
 *   get:
 *     summary: Get all withdrawal requests
 *     tags: [Admin Withdrawal Management]
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
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, processed, failed]
 *         description: Filter by status
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *         description: Filter by driver ID
 *     responses:
 *       200:
 *         description: Withdrawal requests retrieved successfully
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminWithdrawalRequest'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalRequests:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/withdrawals/{requestId}/approve:
 *   put:
 *     summary: Approve withdrawal request
 *     tags: [Admin Withdrawal Management]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNotes:
 *                 type: string
 *                 description: Admin notes (optional)
 *               transactionId:
 *                 type: string
 *                 description: Bank transaction ID (optional)
 *     responses:
 *       200:
 *         description: Withdrawal request approved successfully
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
 *                     request:
 *                       $ref: '#/components/schemas/AdminWithdrawalRequest'
 *                     driverNewBalance:
 *                       type: number
 *       400:
 *         description: Driver has insufficient wallet balance
 *       404:
 *         description: Pending withdrawal request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/withdrawals/{requestId}/reject:
 *   put:
 *     summary: Reject withdrawal request
 *     tags: [Admin Withdrawal Management]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 description: Reason for rejection
 *               adminNotes:
 *                 type: string
 *                 description: Additional admin notes (optional)
 *     responses:
 *       200:
 *         description: Withdrawal request rejected successfully
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
 *                   $ref: '#/components/schemas/AdminWithdrawalRequest'
 *       400:
 *         description: Rejection reason is required
 *       404:
 *         description: Pending withdrawal request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /admin/fellow-drivers:
 *   get:
 *     summary: Get all fellow drivers (Admin)
 *     description: Admin can view all fellow drivers with filtering and pagination options
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by approval status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, mobile number, or license number
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *         description: Filter by main driver ID
 *     responses:
 *       200:
 *         description: Fellow drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     fellowDrivers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FellowDriver'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/pending:
 *   get:
 *     summary: Get pending fellow drivers for approval (Admin)
 *     description: Admin can view all fellow drivers pending approval
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Pending fellow drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     fellowDrivers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FellowDriver'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/{fellowDriverId}:
 *   get:
 *     summary: Get fellow driver details (Admin)
 *     description: Admin can view detailed information about a specific fellow driver
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fellowDriverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fellow driver ID
 *     responses:
 *       200:
 *         description: Fellow driver details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     fellowDriver:
 *                       $ref: '#/components/schemas/FellowDriver'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/{fellowDriverId}/approval:
 *   put:
 *     summary: Update fellow driver approval status (Admin)
 *     description: Admin can approve or reject a fellow driver application
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fellowDriverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fellow driver ID
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
 *                 description: Rejection reason (required if action is reject)
 *     responses:
 *       200:
 *         description: Fellow driver approval status updated successfully
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
 *                     fellowDriver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         approvalStatus:
 *                           type: string
 *                         rejectionReason:
 *                           type: string
 *                         approvedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Invalid action or missing rejection reason
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Server error
 */
