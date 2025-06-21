/**
 * @swagger
 * components:
 *   schemas:
 *     WalletTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction ID
 *         userType:
 *           type: string
 *           enum: [customer, driver]
 *           description: Type of user
 *         transactionType:
 *           type: string
 *           enum: [credit, debit]
 *           description: Transaction type
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         balanceAfter:
 *           type: number
 *           description: Balance after transaction
 *         description:
 *           type: string
 *           description: Transaction description
 *         category:
 *           type: string
 *           enum: [topup, ride_payment, ride_earning, withdrawal, commission, refund]
 *           description: Transaction category
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *           description: Transaction status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Transaction creation date
 *     
 *     PayPalOrder:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           description: PayPal order ID
 *         approvalUrl:
 *           type: string
 *           description: PayPal approval URL
 *         amount:
 *           type: number
 *           description: Order amount
 *         currency:
 *           type: string
 *           description: Currency code
 *     
 *     WalletBalance:
 *       type: object
 *       properties:
 *         balance:
 *           type: number
 *           description: Current wallet balance
 *         recentTransactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WalletTransaction'
 *           description: Recent transactions
 */

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get user wallet balance and recent transactions
 *     tags: [User Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet information retrieved successfully
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
 *                   $ref: '#/components/schemas/WalletBalance'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get user wallet transaction history
 *     tags: [User Wallet]
 *     security:
 *       - bearerAuth: []
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [topup, ride_payment, refund]
 *         description: Filter by category
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [credit, debit]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WalletTransaction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalTransactions:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/paypal/create-order:
 *   post:
 *     summary: Create PayPal order for wallet top-up
 *     tags: [PayPal Integration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 1000
 *                 description: Amount to top up (min $1, max $1000)
 *               currency:
 *                 type: string
 *                 default: USD
 *                 description: Currency code
 *     responses:
 *       200:
 *         description: PayPal order created successfully
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
 *                   $ref: '#/components/schemas/PayPalOrder'
 *       400:
 *         description: Invalid amount or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/paypal/capture/{orderId}:
 *   post:
 *     summary: Capture PayPal payment and credit user wallet
 *     tags: [PayPal Integration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: PayPal order ID
 *     responses:
 *       200:
 *         description: Payment captured successfully
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
 *                     transactionId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     newBalance:
 *                       type: number
 *                     paypalPaymentId:
 *                       type: string
 *       400:
 *         description: Payment capture failed or already completed
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/paypal/transaction/{transactionId}:
 *   get:
 *     summary: Get PayPal transaction details
 *     tags: [PayPal Integration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: PayPal transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/paypal/history:
 *   get:
 *     summary: Get user's PayPal transaction history
 *     tags: [PayPal Integration]
 *     security:
 *       - bearerAuth: []
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
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, approved, completed, cancelled, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
