import { createVehicleBookingEventAdapter } from '../create-vehicle-booking.event-adapter';
import { EventPublisher } from '@shared/events/event-publisher';
import { config } from '@config/config';
import { VehicleBooking } from '@models/vehicle-booking';
import { ServiceMetadata } from '@shared/types/service-metadata';

// Mock dependencies
jest.mock('@shared/events/event-publisher');

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

    EventPublisher.prototype.publish = jest.fn().mockResolvedValue(true);
  });

  it('publishes the correct event with booking and metadata', async () => {
    await createVehicleBookingEventAdapter(mockBooking, mockMetadata);

    // Check EventPublisher constructor
    expect(EventPublisher).toHaveBeenCalledWith('test-bus');

    const publishCall = (EventPublisher as jest.Mock).prototype.publish.mock
      .calls[0][0];
    expect(publishCall).toEqual({
      metadata: {
        causationId: 'req-123',
        correlationId: 'corr-123',
        domain: 'Vehicle',
        service: 'BookingService',
      },
      payload: {
        bookingId: 'b123',
        endDate: new Date('2024-08-11T17:00:00.000Z'),
        options: {
          brakesCheck: false,
          clutchInspection: false,
          oilService: true,
          tireRotation: true,
          washAndVac: true,
        },
        servicePlanId: 'plan-123',
        startDate: new Date('2024-08-10T10:00:00.000Z'),
        status: 'BOOKED',
        userId: 'user-x',
        vehicle: {
          fuelType: 'PETROL',
          make: 'Toyota',
          mileage: 25000,
          model: 'Corolla',
          warrantyId: 'warranty-456',
          year: 2020,
        },
      },
      type: 'VehicleBookingCreated',
    });
  });

  it('propagates errors thrown from publish', async () => {
    (EventPublisher as jest.Mock).mockImplementation(() => ({
      publish: jest.fn().mockRejectedValue(new Error('event failed')),
    }));

    await expect(
      createVehicleBookingEventAdapter(mockBooking, mockMetadata),
    ).rejects.toThrow('event failed');
  });
});
