import {
  createVehicleBookingFromDTO,
  createVehicleBookingToDTO,
} from '../create-booking.factory';

import {
  VehicleBookingRequestDTO,
  VehicleBookingResponseDTO,
} from '@dto/vehicle-booking-dto';

describe('createVehicleBookingFromDTO', () => {
  const baseRequest: VehicleBookingRequestDTO = {
    userId: 'user-123',
    startDate: '2026-05-01T10:00:00.000Z',
    endDate: '2026-05-02T10:00:00.000Z',
    servicePlanId: 'plan-001',
    vehicleDetails: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2025,
      fuelType: 'ELECTRIC',
      mileage: 12000,
      warrantyId: 'warranty-123',
    },
    bookingOptions: {
      oilService: false,
      brakesCheck: true,
      tireRotation: true,
      clutchInspection: false,
      washAndVac: true,
    },
  };

  it('should create a booking payload successfully', () => {
    const result = createVehicleBookingFromDTO(baseRequest);

    expect(result).toEqual({
      userId: 'user-123',
      startDate: new Date('2026-05-01T10:00:00.000Z'),
      endDate: new Date('2026-05-02T10:00:00.000Z'),
      servicePlanId: 'plan-001',
      vehicle: {
        make: 'Tesla',
        model: 'Model 3',
        year: 2025,
        fuelType: 'ELECTRIC',
        mileage: 12000,
        warrantyId: 'warranty-123',
      },
      options: {
        oilService: false,
        brakesCheck: true,
        tireRotation: true,
        clutchInspection: false,
        washAndVac: true,
      },
      status: 'BOOKED',
    });
  });

  describe('date validation', () => {
    it('should throw when startDate is after endDate', () => {
      const invalidRequest: VehicleBookingRequestDTO = {
        ...baseRequest,
        startDate: '2026-05-03T10:00:00.000Z',
        endDate: '2026-05-02T10:00:00.000Z',
      };

      expect(() => createVehicleBookingFromDTO(invalidRequest)).toThrow(
        'Start date must be before end date',
      );
    });

    it('should throw when startDate equals endDate', () => {
      const invalidRequest: VehicleBookingRequestDTO = {
        ...baseRequest,
        startDate: '2026-05-02T10:00:00.000Z',
        endDate: '2026-05-02T10:00:00.000Z',
      };

      expect(() => createVehicleBookingFromDTO(invalidRequest)).toThrow(
        'Start date must be before end date',
      );
    });
  });

  describe('electric vehicle validation', () => {
    it('should throw when electric vehicle requests oil service', () => {
      const invalidRequest: VehicleBookingRequestDTO = {
        ...baseRequest,
        bookingOptions: {
          ...baseRequest.bookingOptions,
          oilService: true,
        },
      };

      expect(() => createVehicleBookingFromDTO(invalidRequest)).toThrow(
        'Oil service not allowed for electric vehicles',
      );
    });

    it('should allow oil service for non-electric vehicles', () => {
      const validRequest: VehicleBookingRequestDTO = {
        ...baseRequest,
        vehicleDetails: {
          ...baseRequest.vehicleDetails!,
          fuelType: 'PETROL',
        },
        bookingOptions: {
          ...baseRequest.bookingOptions,
          oilService: true,
        },
      };

      const result = createVehicleBookingFromDTO(validRequest);

      expect(result.options?.oilService).toBe(true);
      expect(result.vehicle?.fuelType).toBe('PETROL');
    });
  });
});

describe('createVehicleBookingToDTO', () => {
  it('should map booking model to response DTO', () => {
    const booking = {
      bookingId: 'booking-001',
      userId: 'user-123',
      startDate: new Date('2026-05-01T10:00:00.000Z'),
      endDate: new Date('2026-05-02T10:00:00.000Z'),
      status: 'BOOKED',
    };

    const result: VehicleBookingResponseDTO = createVehicleBookingToDTO(
      booking as any,
    );

    expect(result).toEqual({
      bookingId: 'booking-001',
      userId: 'user-123',
      startDate: '2026-05-01T10:00:00.000Z',
      endDate: '2026-05-02T10:00:00.000Z',
      status: 'BOOKED',
    });
  });

  it('should throw if bookingId is missing', () => {
    const booking = {
      userId: 'user-123',
      startDate: new Date('2026-05-01T10:00:00.000Z'),
      endDate: new Date('2026-05-02T10:00:00.000Z'),
      status: 'BOOKED',
    };

    expect(() => createVehicleBookingToDTO(booking as any)).toThrow(
      'Booking ID is required for response DTO',
    );
  });
});
