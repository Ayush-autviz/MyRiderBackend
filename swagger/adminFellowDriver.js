/**
 * @swagger
 * /admin/fellow-drivers:
 *   get:
 *     summary: Get all fellow drivers (Admin)
 *     description: Admin can view all fellow drivers with filtering and pagination options
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by approval status
 *         example: "pending"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, mobile number, or license number
 *         example: "John"
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *         description: Filter by main driver ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Fellow drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminFellowDriverListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/pending:
 *   get:
 *     summary: Get pending fellow drivers for approval (Admin)
 *     description: Admin can view all fellow drivers pending approval
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Pending fellow drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminFellowDriverListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/{fellowDriverId}:
 *   get:
 *     summary: Get fellow driver details (Admin)
 *     description: Admin can view detailed information about a specific fellow driver
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fellowDriverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fellow driver ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     fellowDriver:
 *                       $ref: '#/components/schemas/FellowDriver'
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/{fellowDriverId}/approval:
 *   put:
 *     summary: Update fellow driver approval status (Admin)
 *     description: Admin can approve or reject a fellow driver application
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fellowDriverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fellow driver ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FellowDriverApprovalRequest'
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Fellow driver approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fellowDriver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         approvalStatus:
 *                           type: string
 *                           example: "approved"
 *                         rejectionReason:
 *                           type: string
 *                           example: null
 *                         approvedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T10:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid action or missing rejection reason
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
 *                   example: "Fellow driver is not pending approval"
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/{fellowDriverId}/approve:
 *   put:
 *     summary: Approve fellow driver (Admin)
 *     description: Admin can approve a pending fellow driver application
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fellowDriverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fellow driver ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Fellow driver approved successfully
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
 *                   example: "Fellow driver approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fellowDriver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         approvalStatus:
 *                           type: string
 *                           example: "approved"
 *                         approvedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T10:00:00.000Z"
 *       400:
 *         description: Fellow driver is not pending approval
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /admin/fellow-drivers/{fellowDriverId}/reject:
 *   put:
 *     summary: Reject fellow driver (Admin)
 *     description: Admin can reject a pending fellow driver application with a reason
 *     tags: [Admin - Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fellowDriverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fellow driver ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *                 example: "Invalid license document quality"
 *     responses:
 *       200:
 *         description: Fellow driver rejected successfully
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
 *                   example: "Fellow driver rejected successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fellowDriver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         approvalStatus:
 *                           type: string
 *                           example: "rejected"
 *                         rejectionReason:
 *                           type: string
 *                           example: "Invalid license document quality"
 *       400:
 *         description: Bad request - Missing rejection reason or fellow driver not pending
 *       401:
 *         description: Unauthorized - Invalid or missing admin token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Internal server error
 */
