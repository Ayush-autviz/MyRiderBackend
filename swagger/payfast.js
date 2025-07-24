/**
 * @swagger
 * components:
 *   schemas:
 *     PayFastTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction ID
 *         paymentId:
 *           type: string
 *           description: Unique payment ID
 *         pfPaymentId:
 *           type: string
 *           description: PayFast payment ID
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           enum: [ZAR, USD, EUR, GBP]
 *           description: Currency code
 *         status:
 *           type: string
 *           enum: [created, pending, complete, cancelled, failed]
 *           description: Payment status
 *         itemName:
 *           type: string
 *           description: Item name
 *         itemDescription:
 *           type: string
 *           description: Item description
 *         nameFirst:
 *           type: string
 *           description: Customer first name
 *         nameLast:
 *           type: string
 *           description: Customer last name
 *         emailAddress:
 *           type: string
 *           description: Customer email address
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Payment completion date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Transaction creation date
 *     
 *     PayFastPayment:
 *       type: object
 *       properties:
 *         paymentId:
 *           type: string
 *           description: Unique payment ID
 *         paymentUrl:
 *           type: string
 *           description: PayFast payment URL
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           description: Currency code
 *     
 *     PayFastCreatePaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 5
 *           maximum: 50000
 *           description: Payment amount (minimum R5, maximum R50,000)
 *         currency:
 *           type: string
 *           enum: [ZAR, USD, EUR, GBP]
 *           default: ZAR
 *           description: Currency code
 */

/**
 * @swagger
 * /wallet/payfast/create-payment:
 *   post:
 *     summary: Create PayFast payment for wallet top-up
 *     tags: [PayFast Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayFastCreatePaymentRequest'
 *           example:
 *             amount: 100.00
 *             currency: ZAR
 *     responses:
 *       200:
 *         description: PayFast payment created successfully
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
 *                   example: PayFast payment created successfully
 *                 data:
 *                   $ref: '#/components/schemas/PayFastPayment'
 *       400:
 *         description: Bad request - Invalid amount or validation error
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
 *                   example: Minimum top-up amount is R5
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/payfast/notify:
 *   post:
 *     summary: PayFast ITN (Instant Transaction Notification) webhook
 *     tags: [PayFast Payment]
 *     description: This endpoint receives payment status updates from PayFast. No authentication required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               m_payment_id:
 *                 type: string
 *                 description: Merchant payment ID
 *               pf_payment_id:
 *                 type: string
 *                 description: PayFast payment ID
 *               payment_status:
 *                 type: string
 *                 enum: [COMPLETE, CANCELLED, FAILED]
 *                 description: Payment status
 *               amount_gross:
 *                 type: string
 *                 description: Gross amount
 *               amount_fee:
 *                 type: string
 *                 description: Fee amount
 *               amount_net:
 *                 type: string
 *                 description: Net amount
 *               signature:
 *                 type: string
 *                 description: PayFast signature for validation
 *     responses:
 *       200:
 *         description: ITN processed successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 *       400:
 *         description: Invalid ITN data or signature
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/payfast/status/{paymentId}:
 *   get:
 *     summary: Check PayFast payment status
 *     tags: [PayFast Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
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
 *                   example: Transaction status retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [created, pending, complete, cancelled, failed]
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     walletTransaction:
 *                       $ref: '#/components/schemas/WalletTransaction'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/payfast/transaction/{transactionId}:
 *   get:
 *     summary: Get PayFast transaction details
 *     tags: [PayFast Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
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
 *                   example: Transaction retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/PayFastTransaction'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/payfast/history:
 *   get:
 *     summary: Get PayFast transaction history
 *     tags: [PayFast Payment]
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
 *           enum: [created, pending, complete, cancelled, failed]
 *         description: Filter by payment status
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Transaction history retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PayFastTransaction'
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