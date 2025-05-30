/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         phone:
 *           type: string
 *           description: User's phone number
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           description: User's email
 *         otp:
 *           type: string
 *           description: One-time password for verification
 *         otpExpires:
 *           type: string
 *           format: date-time
 *           description: Expiry time for the OTP
 *         registrationComplete:
 *           type: boolean
 *           description: Whether the user's registration is complete
 *         profileStatus:
 *           type: number
 *           description: "User's profile status (0: inactive, 1: active, 2: suspended)"
 *         profileImage:
 *           type: string
 *           description: URL to the user's profile image
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         phone: "+919876543210"
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john@example.com"
 *         registrationComplete: true
 *         profileStatus: 1
 *         profileImage: "uploads/user-profiles/profile-1234567890.jpg"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 phone:
 *                   type: string
 *                   description: User's phone number
 *                 firstName:
 *                   type: string
 *                   description: User's first name
 *                 lastName:
 *                   type: string
 *                   description: User's last name
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 registrationComplete:
 *                   type: boolean
 *                   description: Whether the user's registration is complete
 *                 profileImage:
 *                   type: string
 *                   description: URL to the user's profile image
 *             access_token:
 *               type: string
 *               description: JWT access token
 *             refresh_token:
 *               type: string
 *               description: JWT refresh token
 *       example:
 *         success: true
 *         message: "User logged in successfully"
 *         data:
 *           user:
 *             id: "60d0fe4f5311236168a109ca"
 *             phone: "+919876543210"
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john@example.com"
 *             registrationComplete: true
 *             profileImage: "uploads/user-profiles/profile-1234567890.jpg"
 *           access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Sign in a user or start registration
 *     tags: [Auth]
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
 *                 description: User's phone number
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
 *                       description: Whether the user is already registered
 *                     registrationComplete:
 *                       type: boolean
 *                       description: Whether the user's registration is complete
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/verifyOTP:
 *   post:
 *     summary: Verify OTP and authenticate user
 *     tags: [Auth]
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
 *                 description: User's phone number
 *               otp:
 *                 type: string
 *                 description: One-time password received
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid OTP or expired
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Complete user registration after OTP verification
 *     tags: [Auth]
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
 *                 description: User's phone number (must match a phone number that has been verified with OTP)
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 description: User's email
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: User not found or already registered
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Auth]
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
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT access token
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
