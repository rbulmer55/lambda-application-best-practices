import { createVehicleBookingAdapter } from '../create-vehicle-booking.api-adapter';
import { createBookingUseCase } from '@use-cases/create-booking';
import { schemaValidator } from '@shared/schema-validator';
import { errorHandler } from '@shared/error-handler';
import { metrics, logger } from '@shared/powertools';
import { getHeaders } from '@shared/headers';
import { ValidationError } from '@errors/validation-error';

import { VehicleBookingRequestSchema } from '../../../../schemas/vehicle-booking';

jest.mock('@use-cases/create-booking');
jest.mock('@shared/schema-validator');
jest.mock('@shared/error-handler');
jest.mock('@shared/powertools');
jest.mock('@shared/headers');

const mockBookingResponse = {
  bookingId: '123',
  status: 'CONFIRMED',
};

const mockPayload = {
  userId: 'user-42',
  startDate: '2024-07-01T09:15:00Z',
  endDate: '2024-07-02T15:45:00Z',
  servicePlanId: 'plan-123',
  vehicleDetails: {
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    fuelType: 'PETROL',
    mileage: 25000,
    warrantyId: 'warranty-456',
  },
  bookingOptions: {
    oilService: true,
    brakesCheck: false,
    tireRotation: true,
    clutchInspection: false,
    washAndVac: true,
  },
};

const mockEvent = {
  body: JSON.stringify(mockPayload),
  headers: {},
  requestContext: { requestId: 'req-123' },
} as any;

describe('createVehicleBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    (getHeaders as jest.Mock).mockReturnValue({ 'x-api': 'test-header' });
    (createBookingUseCase as jest.Mock).mockResolvedValue(mockBookingResponse);

    // No-op for logger and metrics
    (logger.info as jest.Mock).mockImplementation(() => {});
    (logger.error as jest.Mock).mockImplementation(() => {});
    (metrics.addMetric as jest.Mock).mockImplementation(() => {});
  });

  it('should return 200 and booking response when successful', async () => {
    const response = await createVehicleBookingAdapter(mockEvent);

    expect(schemaValidator).toHaveBeenCalledWith(
      VehicleBookingRequestSchema,
      mockPayload,
    );
    expect(createBookingUseCase).toHaveBeenCalledWith(mockPayload, {
      causationId: 'req-123',
      correlationId: 'req-123',
      domain: 'Vehicle',
      service: 'VehicleBookingService',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify(mockBookingResponse));
    expect(response.headers).toEqual({ 'x-api': 'test-header' });
    expect(metrics.addMetric).toHaveBeenCalledWith(
      'BookingCreated',
      expect.anything(),
      1,
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Vehicle booking created',
      expect.objectContaining({ bookingId: mockBookingResponse.bookingId }),
    );
  });

  it('should handle missing body with ValidationError', async () => {
    const event = { ...mockEvent, body: undefined };
    const error = new ValidationError('no payload body');
    (errorHandler as jest.Mock).mockReturnValue({
      statusCode: 400,
      body: 'error',
    });

    const response = await createVehicleBookingAdapter(event);

    expect(response).toEqual({ statusCode: 400, body: 'error' });
    expect(errorHandler).toHaveBeenCalledWith(error);
    expect(logger.error).toHaveBeenCalledWith(error.message);
    expect(metrics.addMetric).toHaveBeenCalledWith(
      'CreateVehicleBookingError',
      expect.anything(),
      1,
    );
  });

  it('should handle schema validation errors', async () => {
    (schemaValidator as jest.Mock).mockImplementation(() => {
      throw new ValidationError('invalid payload');
    });
    (errorHandler as jest.Mock).mockReturnValue({
      statusCode: 422,
      body: 'schema error',
    });

    const response = await createVehicleBookingAdapter(mockEvent);

    expect(errorHandler).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(response).toEqual({ statusCode: 422, body: 'schema error' });
    expect(metrics.addMetric).toHaveBeenCalledWith(
      'CreateVehicleBookingError',
      expect.anything(),
      1,
    );
    expect(logger.error).toHaveBeenCalledWith('invalid payload');
  });

  it('should handle unexpected errors', async () => {
    (createBookingUseCase as jest.Mock).mockImplementation(() => {
      throw new Error('something broke');
    });
    (errorHandler as jest.Mock).mockReturnValue({
      statusCode: 500,
      body: 'server error',
    });

    const response = await createVehicleBookingAdapter(mockEvent);

    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    expect(response).toEqual({ statusCode: 500, body: 'server error' });
    expect(metrics.addMetric).toHaveBeenCalledWith(
      'CreateVehicleBookingError',
      expect.anything(),
      1,
    );
    expect(logger.error).toHaveBeenCalledWith('something broke');
  });
});
