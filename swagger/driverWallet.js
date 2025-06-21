/**
 * @swagger
 * components:
 *   schemas:
 *     WithdrawalRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Withdrawal request ID
 *         driver:
 *           type: string
 *           description: Driver ID
 *         amount:
 *           type: number
 *           description: Withdrawal amount
 *         requestedAmount:
 *           type: number
 *           description: Originally requested amount
 *         bankDetails:
 *           type: object
 *           properties:
 *             accountHolderName:
 *               type: string
 *               description: Account holder name
 *             accountNumber:
 *               type: string
 *               description: Bank account number
 *             bankName:
 *               type: string
 *               description: Bank name
 *             routingNumber:
 *               type: string
 *               description: Routing number
 *             swiftCode:
 *               type: string
 *               description: SWIFT code
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, processed, failed]
 *           description: Request status
 *         adminNotes:
 *           type: string
 *           description: Admin notes
 *         rejectionReason:
 *           type: string
 *           description: Rejection reason
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Request creation date
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Processing date
 *     
 *     BankDetails:
 *       type: object
 *       required:
 *         - accountHolderName
 *         - accountNumber
 *         - bankName
 *       properties:
 *         accountHolderName:
 *           type: string
 *           description: Account holder name
 *         accountNumber:
 *           type: string
 *           description: Bank account number
 *         bankName:
 *           type: string
 *           description: Bank name
 *         routingNumber:
 *           type: string
 *           description: Routing number (optional)
 *         swiftCode:
 *           type: string
 *           description: SWIFT code (optional)
 */

/**
 * @swagger
 * /driver/wallet/balance:
 *   get:
 *     summary: Get driver wallet balance and recent transactions
 *     tags: [Driver Wallet]
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
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       description: Current wallet balance
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WalletTransaction'
 *                       description: Recent transactions
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /driver/wallet/transactions:
 *   get:
 *     summary: Get driver wallet transaction history
 *     tags: [Driver Wallet]
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
 *           enum: [ride_earning, withdrawal, commission]
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /driver/wallet/withdrawal/request:
 *   post:
 *     summary: Create withdrawal request
 *     tags: [Driver Withdrawals]
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
 *               - bankDetails
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 10
 *                 description: Withdrawal amount (minimum $10)
 *               bankDetails:
 *                 $ref: '#/components/schemas/BankDetails'
 *     responses:
 *       201:
 *         description: Withdrawal request created successfully
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
 *                   $ref: '#/components/schemas/WithdrawalRequest'
 *       400:
 *         description: Invalid amount, insufficient balance, or pending request exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Driver not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /driver/wallet/withdrawal/requests:
 *   get:
 *     summary: Get driver's withdrawal requests
 *     tags: [Driver Withdrawals]
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
 *           enum: [pending, approved, rejected, processed, failed]
 *         description: Filter by status
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
 *                         $ref: '#/components/schemas/WithdrawalRequest'
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
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /driver/wallet/withdrawal/request/{requestId}:
 *   get:
 *     summary: Get withdrawal request by ID
 *     tags: [Driver Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID
 *     responses:
 *       200:
 *         description: Withdrawal request retrieved successfully
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
 *                   $ref: '#/components/schemas/WithdrawalRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Withdrawal request not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /driver/wallet/withdrawal/request/{requestId}/cancel:
 *   put:
 *     summary: Cancel withdrawal request
 *     tags: [Driver Withdrawals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal request ID
 *     responses:
 *       200:
 *         description: Withdrawal request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Request cannot be cancelled (not pending)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pending withdrawal request not found
 *       500:
 *         description: Internal server error
 */
