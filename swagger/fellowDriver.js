/**
 * @swagger
 * components:
 *   schemas:
 *     FellowDriver:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Fellow driver unique identifier
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         name:
 *           type: string
 *           description: Fellow driver full name
 *           example: "John Doe"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Fellow driver gender
 *           example: "male"
 *         mobileNumber:
 *           type: string
 *           description: Fellow driver mobile number
 *           example: "+1234567890"
 *         profilePhoto:
 *           type: string
 *           description: URL to profile photo
 *           example: "/uploads/fellow-drivers/profile-photo.jpg"
 *         drivingLicense:
 *           type: object
 *           properties:
 *             front:
 *               type: string
 *               description: URL to front side of driving license
 *               example: "/uploads/fellow-drivers/license-front.jpg"
 *             back:
 *               type: string
 *               description: URL to back side of driving license
 *               example: "/uploads/fellow-drivers/license-back.jpg"
 *             licenseNumber:
 *               type: string
 *               description: Driving license number
 *               example: "DL123456789"
 *         approvalStatus:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Approval status by admin
 *           example: "pending"
 *         rejectionReason:
 *           type: string
 *           description: Reason for rejection (if rejected)
 *           example: "Invalid license document"
 *         driver:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Main driver ID
 *               example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *             firstName:
 *               type: string
 *               description: Main driver first name
 *               example: "Jane"
 *             lastName:
 *               type: string
 *               description: Main driver last name
 *               example: "Smith"
 *             phone:
 *               type: string
 *               description: Main driver phone number
 *               example: "+1987654321"
 *             email:
 *               type: string
 *               description: Main driver email
 *               example: "jane.smith@example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fellow driver creation timestamp
 *           example: "2023-12-01T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fellow driver last update timestamp
 *           example: "2023-12-01T10:00:00.000Z"
 *
 *     FellowDriverRequest:
 *       type: object
 *       required:
 *         - name
 *         - gender
 *         - mobileNumber
 *         - licenseNumber
 *       properties:
 *         name:
 *           type: string
 *           description: Fellow driver full name
 *           example: "John Doe"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Fellow driver gender
 *           example: "male"
 *         mobileNumber:
 *           type: string
 *           description: Fellow driver mobile number
 *           example: "+1234567890"
 *         licenseNumber:
 *           type: string
 *           description: Driving license number
 *           example: "DL123456789"
 *
 *     FellowDriverResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Fellow driver added successfully. Pending admin approval."
 *         data:
 *           type: object
 *           properties:
 *             fellowDriver:
 *               $ref: '#/components/schemas/FellowDriver'
 *
 *     FellowDriverListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             fellowDrivers:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FellowDriver'
 *
 *     AdminFellowDriverListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             fellowDrivers:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FellowDriver'
 *             pagination:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalItems:
 *                   type: integer
 *                   example: 50
 *                 itemsPerPage:
 *                   type: integer
 *                   example: 10
 *
 *     FellowDriverApprovalRequest:
 *       type: object
 *       required:
 *         - action
 *       properties:
 *         action:
 *           type: string
 *           enum: [approve, reject]
 *           description: Approval action
 *           example: "approve"
 *         reason:
 *           type: string
 *           description: Rejection reason (required if action is reject)
 *           example: "Invalid license document"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /fellow-drivers:
 *   post:
 *     summary: Add a new fellow driver
 *     description: Driver can add a new fellow driver with required documents. Fellow driver will be pending approval by admin.
 *     tags: [Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gender
 *               - mobileNumber
 *               - licenseNumber
 *               - profilePhoto
 *               - drivingLicenseFront
 *               - drivingLicenseBack
 *             properties:
 *               name:
 *                 type: string
 *                 description: Fellow driver full name
 *                 example: "John Doe"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Fellow driver gender
 *                 example: "male"
 *               mobileNumber:
 *                 type: string
 *                 description: Fellow driver mobile number
 *                 example: "+1234567890"
 *               licenseNumber:
 *                 type: string
 *                 description: Driving license number
 *                 example: "DL123456789"
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file
 *               drivingLicenseFront:
 *                 type: string
 *                 format: binary
 *                 description: Front side of driving license
 *               drivingLicenseBack:
 *                 type: string
 *                 format: binary
 *                 description: Back side of driving license
 *     responses:
 *       201:
 *         description: Fellow driver added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FellowDriverResponse'
 *       400:
 *         description: Bad request - Missing required fields or files
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
 *                   example: "Profile photo and both sides of driving license are required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Get all fellow drivers for the authenticated driver
 *     description: Retrieve all fellow drivers added by the authenticated driver
 *     tags: [Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fellow drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FellowDriverListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /fellow-drivers/approved:
 *   get:
 *     summary: Get approved fellow drivers for the authenticated driver
 *     description: Retrieve only approved fellow drivers that can be selected when going online
 *     tags: [Fellow Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approved fellow drivers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FellowDriverListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /fellow-drivers/{fellowDriverId}:
 *   put:
 *     summary: Update fellow driver details
 *     description: Update fellow driver information. Only pending or rejected fellow drivers can be updated.
 *     tags: [Fellow Drivers]
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
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Fellow driver full name
 *                 example: "John Doe"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Fellow driver gender
 *                 example: "male"
 *               mobileNumber:
 *                 type: string
 *                 description: Fellow driver mobile number
 *                 example: "+1234567890"
 *               licenseNumber:
 *                 type: string
 *                 description: Driving license number
 *                 example: "DL123456789"
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file (optional)
 *               drivingLicenseFront:
 *                 type: string
 *                 format: binary
 *                 description: Front side of driving license (optional)
 *               drivingLicenseBack:
 *                 type: string
 *                 format: binary
 *                 description: Back side of driving license (optional)
 *     responses:
 *       200:
 *         description: Fellow driver updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FellowDriverResponse'
 *       400:
 *         description: Bad request - Cannot update approved fellow driver
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete fellow driver
 *     description: Soft delete a fellow driver (marks as inactive)
 *     tags: [Fellow Drivers]
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
 *         description: Fellow driver deleted successfully
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
 *                   example: "Fellow driver deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Fellow driver not found
 *       500:
 *         description: Internal server error
 */
