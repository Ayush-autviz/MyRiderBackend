const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { rateRide } = require('../controllers/Rating');

// Mock request and response objects
const mockRequest = (params = {}, body = {}, user = {}) => ({
  params,
  body,
  user,
  io: {
    to: jest.fn().mockReturnValue({
      emit: jest.fn()
    })
  }
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock models
jest.mock('../models/Ride');
jest.mock('../models/Driver');
jest.mock('../models/User');

describe('Rating Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rateRide', () => {
    it('should rate a ride and update driver ratings', async () => {
      // Mock data
      const rideId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const driverId = new mongoose.Types.ObjectId().toString();
      
      // Mock ride
      const mockRide = {
        _id: rideId,
        customer: userId,
        driver: driverId,
        status: 'completed',
        isRated: false,
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock driver
      const mockDriver = {
        _id: driverId,
        ratings: [],
        totalRides: 0,
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Setup mocks
      Ride.findById = jest.fn().mockResolvedValue(mockRide);
      Driver.findById = jest.fn().mockResolvedValue(mockDriver);
      
      // Create request and response
      const req = mockRequest(
        { rideId },
        { rating: 4, review: 'Great ride!' },
        { id: userId }
      );
      const res = mockResponse();
      
      // Call the function
      await rateRide(req, res);
      
      // Assertions
      expect(Ride.findById).toHaveBeenCalledWith(rideId);
      expect(mockRide.rating).toBe(4);
      expect(mockRide.review).toBe('Great ride!');
      expect(mockRide.isRated).toBe(true);
      expect(mockRide.save).toHaveBeenCalled();
      
      expect(Driver.findById).toHaveBeenCalledWith(driverId);
      expect(mockDriver.ratings.length).toBe(1);
      expect(mockDriver.ratings[0].rating).toBe(4);
      expect(mockDriver.ratings[0].comment).toBe('Great ride!');
      expect(mockDriver.totalRides).toBe(1);
      expect(mockDriver.save).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Ride and driver rated successfully',
        data: {
          ride: {
            id: rideId,
            rating: 4,
            review: 'Great ride!'
          }
        }
      });
    });

    // Add more test cases for error scenarios
  });
});
