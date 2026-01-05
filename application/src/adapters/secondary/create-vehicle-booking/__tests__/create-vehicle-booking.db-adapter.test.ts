import { createVehicleBookingDatabaseAdapter } from '../create-vehicle-booking.db-adapter';
import { BookingRepository } from '@shared/database/repositories/booking-repository';
import { logger } from '@shared/powertools';
import { VehicleBooking, VehicleBookingPayload } from '@models/vehicle-booking';
import { bookingStatus } from '@shared/types/booking-status';

// Mock dependencies
jest.mock('@shared/database/repositories/booking-repository');
jest.mock('@shared/powertools');

describe('createVehicleBookingDatabaseAdapter', () => {
  const mockBookingPayload: VehicleBookingPayload & { status: bookingStatus } =
    {
      userId: 'user-42',
      servicePlanId: 'plan-123',
      vehicle: {
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        fuelType: 'PETROL',
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
      startDate: new Date('2024-08-10T10:00:00Z'),
      endDate: new Date('2024-08-11T17:00:00Z'),
      status: 'BOOKED',
    };

  const mockSavedBooking: VehicleBooking = {
    ...mockBookingPayload,
    bookingId: 'booking-123',
    createdAt: new Date('2024-08-09T09:00:00Z'),
    updatedAt: new Date('2024-08-09T09:00:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (logger.info as jest.Mock).mockImplementation(() => {});

    BookingRepository.prototype.createBooking = jest
      .fn()
      .mockResolvedValue(mockSavedBooking);
  });

  it('should save booking and return the saved booking', async () => {
    (BookingRepository as any).prototype.createBooking = jest
      .fn()
      .mockResolvedValue(mockSavedBooking);

    expect(BookingRepository).not.toHaveBeenCalled(); // Should be 0 before
    const result = await createVehicleBookingDatabaseAdapter(
      mockBookingPayload,
    );
    expect(BookingRepository).toHaveBeenCalledTimes(1); // Should be 1 after

    // Ensure logger called appropriately
    expect(logger.info).toHaveBeenCalledWith('Saving Booking to database');
    expect(logger.info).toHaveBeenCalledWith('Booking Saved', {
      bookingId: mockSavedBooking.bookingId,
    });

    const createBookingCall = (BookingRepository as any).prototype.createBooking
      .mock.calls[0][0];
    expect(createBookingCall).toEqual(mockBookingPayload);

    // Returns correct booking
    expect(result).toEqual(mockSavedBooking);
  });

  it('should propagate errors from BookingRepository.createBooking', async () => {
    // @ts-ignore
    BookingRepository.mockImplementation(() => ({
      createBooking: jest.fn().mockRejectedValue(new Error('DB error')),
    }));

    // Should throw
    await expect(
      createVehicleBookingDatabaseAdapter(mockBookingPayload),
    ).rejects.toThrow('DB error');

    // Ensure logger.info called for saving booking
    expect(logger.info).toHaveBeenCalledWith('Saving Booking to database');
    // May NOT be called with Booking Saved if DB failed
    expect(logger.info).not.toHaveBeenCalledWith(
      'Booking Saved',
      expect.anything(),
    );
  });
});
