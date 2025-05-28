/**
 * @swagger
 * tags:
 *   name: Socket
 *   description: WebSocket events for real-time communication
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SocketConnection:
 *       type: object
 *       required:
 *         - access_token
 *       properties:
 *         access_token:
 *           type: string
 *           description: JWT access token for authentication
 *       example:
 *         access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     BookRideEvent:
 *       type: object
 *       required:
 *         - rideId
 *       properties:
 *         rideId:
 *           type: string
 *           description: ID of the ride to book
 *       example:
 *         rideId: "60d0fe4f5311236168a109cd"
 *
 *     FindRidersResponse:
 *       type: object
 *       properties:
 *         rideId:
 *           type: string
 *           description: ID of the ride
 *         rideDetails:
 *           type: object
 *           properties:
 *             customerId:
 *               type: string
 *               description: ID of the customer
 *             pickupLocation:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   description: Pickup location address
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Pickup location coordinates [longitude, latitude]
 *             destination:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   description: Destination address
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Destination coordinates [longitude, latitude]
 *             vehicle:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Vehicle ID
 *                 type:
 *                   type: string
 *                   description: Vehicle type
 *                 pricePerKm:
 *                   type: number
 *                   description: Price per kilometer
 *             status:
 *               type: string
 *               description: Current status of the ride
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the ride was created
 *       example:
 *         rideId: "60d0fe4f5311236168a109cd"
 *         rideDetails:
 *           customerId: "60d0fe4f5311236168a109ca"
 *           pickupLocation:
 *             address: "123 Main St, City"
 *             coordinates: [77.5946, 12.9716]
 *           destination:
 *             address: "456 Park Ave, City"
 *             coordinates: [77.6146, 12.9816]
 *           vehicle:
 *             _id: "60d0fe4f5311236168a109cc"
 *             type: "Economy"
 *             pricePerKm: 10.5
 *           status: "pending"
 *           createdAt: "2023-05-01T10:30:00Z"
 *
 *     RideAcceptedResponse:
 *       type: object
 *       properties:
 *         rideId:
 *           type: string
 *           description: ID of the ride
 *         driverId:
 *           type: string
 *           description: ID of the driver who accepted the ride
 *         driver:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *               description: Driver's first name
 *             lastName:
 *               type: string
 *               description: Driver's last name
 *             vehicleDetails:
 *               type: object
 *               properties:
 *                 vehicleType:
 *                   type: string
 *                   description: Type of vehicle
 *                 vehicleNumber:
 *                   type: string
 *                   description: Vehicle registration number
 *                 vehicleModel:
 *                   type: string
 *                   description: Vehicle model
 *             currentLocation:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "Point"
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Driver's current location [longitude, latitude]
 *       example:
 *         rideId: "60d0fe4f5311236168a109cd"
 *         driverId: "60d0fe4f5311236168a109cb"
 *         driver:
 *           firstName: "John"
 *           lastName: "Doe"
 *           vehicleDetails:
 *             vehicleType: "Sedan"
 *             vehicleNumber: "KA01AB1234"
 *             vehicleModel: "Honda City"
 *           currentLocation:
 *             type: "Point"
 *             coordinates: [77.5946, 12.9716]
 *
 *     NoDriversAvailableResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *       example:
 *         message: "No drivers available nearby"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *       example:
 *         message: "Error booking ride"
 */

/**
 * @swagger
 * /socket.io:
 *   get:
 *     summary: WebSocket connection endpoint
 *     tags: [Socket]
 *     description: |
 *       This is the WebSocket connection endpoint. The client should connect to this endpoint using a WebSocket client library.
 *
 *       **Authentication:**
 *
 *       Include the JWT access token in the handshake headers:
 *       ```
 *       {
 *         "access_token": "your-jwt-token"
 *       }
 *       ```
 *
 *       **Common Events:**
 *
 *       1. **joinRideRoom** - Emitted by either customer or driver to join a specific ride room
 *          - Payload: `"ride-id"`
 *          - Response events:
 *            - `roomJoined` - Emitted when successfully joined the room
 *            - `error` - Emitted when an error occurs
 *
 *       **Customer Events:**
 *
 *       1. **bookRide** - Emitted by the customer to book a ride
 *          - Payload: `{ rideId: "ride-id" }`
 *          - Response events:
 *            - `findRiders` - Emitted to the customer when the system starts looking for drivers
 *            - `noDriversAvailable` - Emitted when no drivers are available nearby
 *            - `rideAccepted` - Emitted when a driver accepts the ride
 *            - `driverArrived` - Emitted when the driver has arrived at the pickup location
 *            - `driverWaiting` - Emitted when the driver is waiting for the customer (includes ride OTP)
 *            - `otpVerified` - Emitted when the ride OTP has been verified
 *            - `rideStarted` - Emitted when the ride has started (moving to destination)
 *            - `rideCompleted` - Emitted when the ride has been completed
 *            - `error` - Emitted when an error occurs
 *
 *       2. **searchNearbyDrivers** - Emitted by the customer to search for nearby drivers
 *          - Payload: `{ latitude: number, longitude: number }`
 *          - Response events:
 *            - `nearbyDrivers` - Emitted with a list of nearby drivers
 *            - `error` - Emitted when an error occurs
 *
 *       3. **subscribeToDriverLocation** - Emitted by the customer to subscribe to a driver's location updates
 *          - Payload: `"driver-id"`
 *          - Response events:
 *            - `driverLocationUpdate` - Emitted when the driver's location changes
 *            - `error` - Emitted when an error occurs
 *
 *       **Driver Events:**
 *
 *       1. **goOnDuty** - Emitted by the driver to go online
 *          - Payload: `{ latitude: number, longitude: number }`
 *
 *       2. **goOffDuty** - Emitted by the driver to go offline
 *          - No payload
 *
 *       3. **updateLocation** - Emitted by the driver to update their location
 *          - Payload: `{ latitude: number, longitude: number }`
 *
 *       4. **acceptRide** - Emitted by the driver to accept a ride
 *          - Payload: `"ride-id"`
 *          - Response events:
 *            - `error` - Emitted when an error occurs
 *     responses:
 *       101:
 *         description: WebSocket handshake successful
 */
