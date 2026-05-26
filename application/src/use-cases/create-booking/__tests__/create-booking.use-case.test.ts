import { createBookingUseCase } from '../create-booking.use-case';

import {
  createVehicleBookingFromDTO,
  createVehicleBookingToDTO,
} from '../create-booking.factory';

import {
  createVehicleBookingDatabaseAdapter,
  createVehicleBookingEventAdapter,
} from '@adapters/secondary/create-vehicle-booking';

jest.mock('../create-booking.factory', () => ({
  createVehicleBookingFromDTO: jest.fn(),
  createVehicleBookingToDTO: jest.fn(),
}));

jest.mock('@adapters/secondary/create-vehicle-booking', () => ({
  createVehicleBookingDatabaseAdapter: jest.fn(),
  createVehicleBookingEventAdapter: jest.fn(),
}));

describe('createBookingUseCase', () => {
  const dto = {
    userId: 'user-123',
    startDate: '2026-05-01T10:00:00.000Z',
    endDate: '2026-05-02T10:00:00.000Z',
    servicePlanId: 'plan-001',
  };

  const metadata = {
    correlationId: 'corr-123',
    requestId: 'req-123',
  };

  const mappedBooking = {
    userId: 'user-123',
    startDate: new Date('2026-05-01T10:00:00.000Z'),
    endDate: new Date('2026-05-02T10:00:00.000Z'),
    servicePlanId: 'plan-001',
    status: 'BOOKED',
  };

  const createdBooking = {
    bookingId: 'booking-001',
    ...mappedBooking,
  };

  const responseDto = {
    bookingId: 'booking-001',
    userId: 'user-123',
    startDate: '2026-05-01T10:00:00.000Z',
    endDate: '2026-05-02T10:00:00.000Z',
    status: 'BOOKED',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createVehicleBookingFromDTO as jest.Mock).mockReturnValue(mappedBooking);

    (createVehicleBookingDatabaseAdapter as jest.Mock).mockResolvedValue(
      createdBooking,
    );

    (createVehicleBookingEventAdapter as jest.Mock).mockResolvedValue(
      undefined,
    );

    (createVehicleBookingToDTO as jest.Mock).mockReturnValue(responseDto);
  });

  it('should call all functions with the correct payloads', async () => {
    const result = await createBookingUseCase(dto as any, metadata as any);

    // validate DTO transformation
    expect(createVehicleBookingFromDTO).toHaveBeenCalledTimes(1);
    expect(createVehicleBookingFromDTO).toHaveBeenCalledWith(dto);

    // validate database adapter call
    expect(createVehicleBookingDatabaseAdapter).toHaveBeenCalledTimes(1);
    expect(createVehicleBookingDatabaseAdapter).toHaveBeenCalledWith(
      mappedBooking,
    );

    // validate event adapter call
    expect(createVehicleBookingEventAdapter).toHaveBeenCalledTimes(1);
    expect(createVehicleBookingEventAdapter).toHaveBeenCalledWith(
      createdBooking,
      metadata,
    );

    // validate response DTO transformation
    expect(createVehicleBookingToDTO).toHaveBeenCalledTimes(1);
    expect(createVehicleBookingToDTO).toHaveBeenCalledWith(createdBooking);

    // validate final response
    expect(result).toEqual(responseDto);
  });

  it('should propagate errors from createVehicleBookingFromDTO', async () => {
    const error = new Error('Invalid booking');

    (createVehicleBookingFromDTO as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await expect(
      createBookingUseCase(dto as any, metadata as any),
    ).rejects.toThrow('Invalid booking');

    expect(createVehicleBookingDatabaseAdapter).not.toHaveBeenCalled();
    expect(createVehicleBookingEventAdapter).not.toHaveBeenCalled();
    expect(createVehicleBookingToDTO).not.toHaveBeenCalled();
  });

  it('should propagate errors from database adapter', async () => {
    const error = new Error('Database failure');

    (createVehicleBookingDatabaseAdapter as jest.Mock).mockRejectedValue(error);

    await expect(
      createBookingUseCase(dto as any, metadata as any),
    ).rejects.toThrow('Database failure');

    expect(createVehicleBookingEventAdapter).not.toHaveBeenCalled();
    expect(createVehicleBookingToDTO).not.toHaveBeenCalled();
  });

  it('should propagate errors from event adapter', async () => {
    const error = new Error('Event publish failure');

    (createVehicleBookingEventAdapter as jest.Mock).mockRejectedValue(error);

    await expect(
      createBookingUseCase(dto as any, metadata as any),
    ).rejects.toThrow('Event publish failure');

    expect(createVehicleBookingToDTO).not.toHaveBeenCalled();
  });
});
