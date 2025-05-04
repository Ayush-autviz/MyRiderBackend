/**
 * @swagger
 * components:
 *   schemas:
 *     Driver:
 *       type: object
 *       required:
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the driver
 *         phone:
 *           type: string
 *           description: Driver's phone number
 *         firstName:
 *           type: string
 *           description: Driver's first name
 *         lastName:
 *           type: string
 *           description: Driver's last name
 *         email:
 *           type: string
 *           description: Driver's email
 *         isVerified:
 *           type: boolean
 *           description: Whether the driver is verified
 *         registrationComplete:
 *           type: boolean
 *           description: Whether the driver's registration is complete
 *         accountStatus:
 *           type: string
 *           enum: [VehiclePending, DocumentsPending, ApprovalPending, active, suspended, rejected]
 *           description: Current status of the driver's account
 *         vehicleDetails:
 *           type: object
 *           properties:
 *             brand:
 *               type: string
 *               description: Brand of the vehicle
 *             model:
 *               type: string
 *               description: Model of the vehicle
 *             year:
 *               type: number
 *               description: Manufacturing year of the vehicle
 *             color:
 *               type: string
 *               description: Color of the vehicle
 *             licensePlate:
 *               type: string
 *               description: License plate number of the vehicle
 *             vehicleImage:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: URL to the vehicle image
 *                 verified:
 *                   type: boolean
 *                   description: Whether the vehicle image is verified
 *             numberPlateImage:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: URL to the number plate image
 *                 verified:
 *                   type: boolean
 *                   description: Whether the number plate image is verified
 *         documents:
 *           type: object
 *           properties:
 *             drivingLicense:
 *               type: object
 *               properties:
 *                 front:
 *                   type: string
 *                   description: URL to driving license front image
 *                 back:
 *                   type: string
 *                   description: URL to driving license back image
 *                 verified:
 *                   type: boolean
 *                   description: Whether the driving license is verified
 *             vehicleRegistration:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: URL to vehicle registration document
 *                 verified:
 *                   type: boolean
 *                   description: Whether the vehicle registration is verified
 *             profilePhoto:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: URL to profile photo
 *                 verified:
 *                   type: boolean
 *                   description: Whether the profile photo is verified
 *         isOnline:
 *           type: boolean
 *           description: Whether the driver is online and available
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: "Point"
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [77.5946, 12.9716]
 *       example:
 *         _id: "60d0fe4f5311236168a109cb"
 *         phone: "+919876543210"
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "driver@example.com"
 *         isVerified: true
 *         registrationComplete: true
 *         accountStatus: "active"
 *         vehicleDetails:
 *           brand: "Honda"
 *           model: "City"
 *           year: 2020
 *           color: "White"
 *           licensePlate: "KA01AB1234"
 *           vehicleImage:
 *             image: "/uploads/vehicles/image123.jpg"
 *             verified: true
 *           numberPlateImage:
 *             image: "/uploads/vehicles/numberplate123.jpg"
 *             verified: true
 *         documents:
 *           drivingLicense:
 *             front: "/uploads/driver-documents/drivingLicenseFront-123.jpg"
 *             back: "/uploads/driver-documents/drivingLicenseBack-123.jpg"
 *             verified: true
 *           vehicleRegistration:
 *             image: "/uploads/driver-documents/vehicleRegistration-123.jpg"
 *             verified: true
 *           profilePhoto:
 *             image: "/uploads/driver-documents/profilePhoto-123.jpg"
 *             verified: true
 *         isAvailable: true
 *         currentLocation:
 *           type: "Point"
 *           coordinates: [77.5946, 12.9716]
 *
 *     DriverAuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *         driver:
 *           $ref: '#/components/schemas/Driver'
 */

/**
 * @swagger
 * tags:
 *   name: DriverAuth
 *   description: Driver authentication and management endpoints
 */

/**
 * @swagger
 * /driverAuth/login:
 *   post:
 *     summary: Driver login or start registration
 *     tags: [DriverAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Driver's phone number
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: OTP sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     existingUser:
 *                       type: boolean
 *                       description: Whether the driver is already registered
 *                     registrationComplete:
 *                       type: boolean
 *                       description: Whether the driver's registration is complete
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /driverAuth/verifyOTP:
 *   post:
 *     summary: Verify OTP and authenticate driver
 *     tags: [DriverAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Driver's phone number
 *               otp:
 *                 type: string
 *                 description: One-time password received
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: "OTP verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Driver ID
 *                         phone:
 *                           type: string
 *                           description: Driver's phone number
 *                         firstName:
 *                           type: string
 *                           description: Driver's first name
 *                         lastName:
 *                           type: string
 *                           description: Driver's last name
 *                         email:
 *                           type: string
 *                           description: Driver's email
 *                         registrationComplete:
 *                           type: boolean
 *                           description: Whether the driver's registration is complete
 *                         accountStatus:
 *                           type: string
 *                           description: Driver's account status
 *                     access_token:
 *                       type: string
 *                       description: JWT access token
 *                     refresh_token:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Invalid OTP or expired
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /driverAuth/register:
 *   post:
 *     summary: Complete driver registration after OTP verification
 *     tags: [DriverAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - firstName
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Driver's phone number (must match a phone number that has been verified with OTP)
 *               firstName:
 *                 type: string
 *                 description: Driver's first name
 *               lastName:
 *                 type: string
 *                 description: Driver's last name
 *               email:
 *                 type: string
 *                 description: Driver's email
 *     responses:
 *       200:
 *         description: Driver registered successfully
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
 *                   example: "Driver registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Driver ID
 *                         phone:
 *                           type: string
 *                           description: Driver's phone number
 *                         firstName:
 *                           type: string
 *                           description: Driver's first name
 *                         lastName:
 *                           type: string
 *                           description: Driver's last name
 *                         email:
 *                           type: string
 *                           description: Driver's email
 *                         registrationComplete:
 *                           type: boolean
 *                           description: Whether the driver's registration is complete
 *                         accountStatus:
 *                           type: string
 *                           description: Driver's account status
 *                     access_token:
 *                       type: string
 *                       description: JWT access token
 *                     refresh_token:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Driver not found or already registered
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /driverAuth/drivers/{driverId}/vehicle-details:
 *   put:
 *     summary: Submit vehicle details
 *     tags: [DriverAuth]
 *     security:
 *       - bearerAuth: []
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - licensePlate
 *               - vehicleType
 *               - vehicleImage
 *               - numberPlateImage
 *             properties:
 *               brand:
 *                 type: string
 *                 description: Brand of the vehicle
 *               model:
 *                 type: string
 *                 description: Model of the vehicle
 *               year:
 *                 type: number
 *                 description: Manufacturing year of the vehicle
 *               color:
 *                 type: string
 *                 description: Color of the vehicle
 *               licensePlate:
 *                 type: string
 *                 description: License plate number of the vehicle
 *               vehicleType:
 *                 type: string
 *                 description: Type of vehicle (car or bike)
 *               vehicleImage:
 *                 type: string
 *                 format: binary
 *                 description: Image of the vehicle
 *               numberPlateImage:
 *                 type: string
 *                 format: binary
 *                 description: Image of the vehicle's number plate
 *     responses:
 *       200:
 *         description: Vehicle details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /driverAuth/drivers/{driverId}/upload-documents:
 *   put:
 *     summary: Upload driver documents
 *     tags: [DriverAuth]
 *     security:
 *       - bearerAuth: []
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - drivingLicenseFront
 *               - drivingLicenseBack
 *               - vehicleRegistration
 *               - profilePhoto
 *             properties:
 *               drivingLicenseFront:
 *                 type: string
 *                 format: binary
 *                 description: Driving license front image
 *               drivingLicenseBack:
 *                 type: string
 *                 format: binary
 *                 description: Driving license back image
 *               vehicleRegistration:
 *                 type: string
 *                 format: binary
 *                 description: Vehicle registration document
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /driverAuth/driver/details:
 *   get:
 *     summary: Get driver details
 *     tags: [DriverAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /driverAuth/go-online:
 *   post:
 *     summary: Set driver status to online
 *     tags: [DriverAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *               - location
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: Driver ID
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: Latitude coordinate
 *                   longitude:
 *                     type: number
 *                     description: Longitude coordinate
 *     responses:
 *       200:
 *         description: Driver is now online
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Driver is now online
 *                 driver:
 *                   $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /driverAuth/go-online-with-extra:
 *   post:
 *     summary: Set driver status to online with extra parameters
 *     tags: [DriverAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *               - location
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: Driver ID
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: Latitude coordinate
 *                   longitude:
 *                     type: number
 *                     description: Longitude coordinate
 *               extraParams:
 *                 type: object
 *                 description: Additional parameters
 *     responses:
 *       200:
 *         description: Driver is now online with extra parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Driver is now online with extra parameters
 *                 driver:
 *                   $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
