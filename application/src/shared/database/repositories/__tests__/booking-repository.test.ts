import { BookingRepository } from '../booking-repository';
import { getMongoDb } from '../../connection';
import { logger } from '@shared/powertools';
import { ObjectId } from 'mongodb';

jest.mock('../../connection');
jest.mock('@shared/powertools');

jest.mock('mongodb', () => ({
  ObjectId: jest.fn((s?: string) => {
    // if constructor called with a string, return it as toString()
    return {
      toString: () => s ?? 'mockedObjectId',
      // For use in findOne, preserve valueOf for equality ops
      valueOf: () => s ?? 'mockedObjectId',
    };
  }),
}));

describe('BookingRepository', () => {
  let collectionMock: any;
  let dbMock: any;
  let bookingRepo: BookingRepository;

  const basePayload = {
    userId: 'user-42',
    startDate: new Date('2024-09-01T10:00:00Z'),
    endDate: new Date('2024-09-01T17:00:00Z'),
    status: 'BOOKED' as const,
    vehicle: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      fuelType: 'PETROL' as const,
      mileage: 25000,
      warrantyId: 'warranty-456',
    },
    options: {
      oilService: true,
      brakesCheck: false,
      tireRotation: true,
      clutchInspection: false,
      washAndVac: true,
    },
    servicePlanId: 'plan-321',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    collectionMock = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
    };
    dbMock = {
      collection: jest.fn().mockReturnValue(collectionMock),
    };
    (getMongoDb as jest.Mock).mockResolvedValue(dbMock);
    bookingRepo = new BookingRepository();

    (logger.info as jest.Mock).mockImplementation(() => {});
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  describe('createBooking', () => {
    it('should insert booking and return stored entity', async () => {
      collectionMock.insertOne.mockResolvedValue({});

      const result = await bookingRepo.createBooking(basePayload);

      // Assert collection insert
      expect(getMongoDb).toHaveBeenCalled();
      expect(dbMock.collection).toHaveBeenCalledWith('vehicleBookings');
      expect(collectionMock.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          ...basePayload,
          bookingId: expect.any(String),
          _id: expect.any(Object),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );

      // Assert logger
      expect(logger.info).toHaveBeenCalledWith('Booking saved to database', {
        bookingId: expect.any(String),
      });

      // Returns full booking (including times & _id)
      expect(result).toMatchObject({
        ...basePayload,
        bookingId: expect.any(String),
        _id: expect.any(Object),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should log error and propagate if insert fails', async () => {
      collectionMock.insertOne.mockRejectedValue(new Error('DB insert error'));

      await expect(bookingRepo.createBooking(basePayload)).rejects.toThrow(
        'DB insert error',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to save booking',
        expect.objectContaining({
          bookingId: expect.any(String),
          error: expect.any(Error),
        }),
      );
    });
  });

  describe('getBookingById', () => {
    it('should call findOne and return booking data', async () => {
      const bookingId = 'myObjectId123';
      const doc = {
        userId: 'user-42',
        startDate: '2024-09-01T10:00:00Z',
        endDate: '2024-09-01T17:00:00Z',
        status: 'BOOKED',
        vehicle: { make: 'Toyota' },
        options: { oilService: true },
        servicePlanId: 'plan-321',
      };
      collectionMock.findOne.mockResolvedValue(doc);

      const result = await bookingRepo.getBookingById(bookingId);

      expect(getMongoDb).toHaveBeenCalled();
      expect(dbMock.collection).toHaveBeenCalledWith('vehicleBookings');
      expect(collectionMock.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
      expect(result).toEqual({
        bookingId,
        ...doc,
      });
    });

    it('should return null if no doc found', async () => {
      collectionMock.findOne.mockResolvedValue(null);

      const result = await bookingRepo.getBookingById('id-not-found');
      expect(result).toBeNull();
    });
  });
});
