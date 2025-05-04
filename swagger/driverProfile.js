/**
 * @swagger
 * tags:
 *   name: DriverProfile
 *   description: Driver profile management endpoints
 */

/**
 * @swagger
 * /driverAuth/driver/edit-profile:
 *   put:
 *     summary: Edit driver basic profile information
 *     tags: [DriverProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Driver's first name
 *               lastName:
 *                 type: string
 *                 description: Driver's last name
 *               email:
 *                 type: string
 *                 description: Driver's email
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo
 *     responses:
 *       200:
 *         description: Driver profile updated successfully
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
 *                   example: Driver profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     driverId:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     profilePhoto:
 *                       type: string
 *                       example: uploads/driver-documents/profilePhoto-123.jpg
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 *
 * /driverAuth/driver/edit-vehicle:
 *   put:
 *     summary: Edit driver vehicle details
 *     tags: [DriverProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle details updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     driverId:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     vehicleDetails:
 *                       type: object
 *                       properties:
 *                         brand:
 *                           type: string
 *                           example: Honda
 *                         model:
 *                           type: string
 *                           example: City
 *                         year:
 *                           type: number
 *                           example: 2020
 *                         color:
 *                           type: string
 *                           example: White
 *                         licensePlate:
 *                           type: string
 *                           example: KA01AB1234
 *                         vehicleImage:
 *                           type: object
 *                           properties:
 *                             image:
 *                               type: string
 *                               example: uploads/vehicles/image123.jpg
 *                             verified:
 *                               type: boolean
 *                               example: false
 *                         numberPlateImage:
 *                           type: object
 *                           properties:
 *                             image:
 *                               type: string
 *                               example: uploads/vehicles/numberplate123.jpg
 *                             verified:
 *                               type: boolean
 *                               example: false
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 *
 * /driverAuth/driver/edit-documents:
 *   put:
 *     summary: Edit driver documents
 *     tags: [DriverProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *     responses:
 *       200:
 *         description: Driver documents updated successfully
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
 *                   example: Driver documents updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     driverId:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     documents:
 *                       type: object
 *                       properties:
 *                         drivingLicense:
 *                           type: object
 *                           properties:
 *                             front:
 *                               type: string
 *                               example: uploads/driver-documents/drivingLicenseFront-123.jpg
 *                             back:
 *                               type: string
 *                               example: uploads/driver-documents/drivingLicenseBack-123.jpg
 *                             verified:
 *                               type: boolean
 *                               example: false
 *                         vehicleRegistration:
 *                           type: object
 *                           properties:
 *                             image:
 *                               type: string
 *                               example: uploads/driver-documents/vehicleRegistration-123.jpg
 *                             verified:
 *                               type: boolean
 *                               example: false
 *                     accountStatus:
 *                       type: string
 *                       example: ApprovalPending
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 *
 * /driverAuth/drivers/{driverId}/update-status:
 *   put:
 *     summary: Update driver status from ApprovalPending to active
 *     tags: [DriverProfile]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver status updated successfully
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
 *                   example: Driver status updated to active
 *                 data:
 *                   type: object
 *                   properties:
 *                     driverId:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     accountStatus:
 *                       type: string
 *                       example: active
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request or driver not in ApprovalPending status
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Server error
 */
