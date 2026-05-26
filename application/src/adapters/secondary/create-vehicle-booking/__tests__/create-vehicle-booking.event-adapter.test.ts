import { createVehicleBookingEventAdapter } from '../create-vehicle-booking.event-adapter';
import { EventPublisher } from '@shared/events/event-publisher';
import { config } from '@config/config';
import { VehicleBooking } from '@models/vehicle-booking';
import { ServiceMetadata } from '@shared/types/service-metadata';

// Mock dependencies
jest.mock('@shared/events/event-publisher');

jest.mock('@config/config', () => ({
  config: {
    get: jest.fn(),
  },
}));

describe('createVehicleBookingEventAdapter', () => {
  const mockBooking: VehicleBooking = {
    bookingId: 'b123',
    userId: 'user-x',
    startDate: new Date('2024-08-10T10:00:00Z'),
    endDate: new Date('2024-08-11T17:00:00Z'),
    createdAt: new Date('2024-08-09T09:00:00Z'),
    updatedAt: new Date('2024-08-09T09:00:00Z'),
    status: 'BOOKED',
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
    servicePlanId: 'plan-123',
  };

  const mockMetadata: ServiceMetadata = {
    causationId: 'req-123',
    correlationId: 'corr-123',
    domain: 'Vehicle',
    service: 'BookingService',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock config value
    (config.get as jest.Mock).mockReturnValue('test-bus');

    // Mock publish method
    EventPublisher.prototype.publish = jest.fn().mockResolvedValue(true);
  });

  it('publishes the correct event with booking and metadata', async () => {
    await createVehicleBookingEventAdapter(mockBooking, mockMetadata);

    // Verify config lookup
    expect(config.get).toHaveBeenCalledWith('vehicleEventBusName');

    // Verify EventPublisher instantiated correctly
    expect(EventPublisher).toHaveBeenCalledWith('test-bus');

    // Verify publish payload
    expect(EventPublisher.prototype.publish).toHaveBeenCalledWith({
      type: 'VehicleBookingCreated',
      payload: {
        bookingId: 'b123',
        userId: 'user-x',
        startDate: new Date('2024-08-10T10:00:00.000Z'),
        endDate: new Date('2024-08-11T17:00:00.000Z'),
        status: 'BOOKED',
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
        servicePlanId: 'plan-123',
      },
      metadata: {
        causationId: 'req-123',
        correlationId: 'corr-123',
        domain: 'Vehicle',
        service: 'BookingService',
      },
    });
  });

  it('propagates errors thrown from publish', async () => {
    EventPublisher.prototype.publish = jest
      .fn()
      .mockRejectedValue(new Error('event failed'));

    await expect(
      createVehicleBookingEventAdapter(mockBooking, mockMetadata),
    ).rejects.toThrow('event failed');

    expect(config.get).toHaveBeenCalledWith('vehicleEventBusName');
    expect(EventPublisher).toHaveBeenCalledWith('test-bus');
  });
});
