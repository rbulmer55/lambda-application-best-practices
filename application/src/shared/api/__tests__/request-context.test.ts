import { injectRequestContext } from '../request-context';
import { config } from '@config/config';
import { logger, tracer } from '@shared/powertools';

jest.mock('@shared/powertools');

// Mock event shape
const mockEvent = {
  requestContext: {
    requestId: 'req-123',
  },
} as any;

describe('injectRequestContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Make tracer/appendKeys no-ops
    (tracer.putAnnotation as jest.Mock).mockImplementation(() => {});
    (logger.appendKeys as jest.Mock).mockImplementation(() => {});
  });

  it('should inject metadata with default causationId', () => {
    const result = injectRequestContext(mockEvent);

    expect(result).toEqual({
      correlationId: 'req-123',
      causationId: 'req-123',
      service: 'VehicleBookingService',
      domain: 'Vehicle',
    });

    // Tracer annotations
    expect(tracer.putAnnotation).toHaveBeenCalledWith(
      'correlationId',
      'req-123',
    );
    expect(tracer.putAnnotation).toHaveBeenCalledWith('causationId', 'req-123');
    expect(tracer.putAnnotation).toHaveBeenCalledWith(
      'service',
      'VehicleBookingService',
    );

    // Logger context
    expect(logger.appendKeys).toHaveBeenCalledWith({
      correlationId: 'req-123',
      causationId: 'req-123',
      serviceName: 'VehicleBookingService',
    });
  });

  it('should inject metadata with a provided causationId', () => {
    const result = injectRequestContext(mockEvent, 'cause-xyz');

    expect(result).toEqual({
      correlationId: 'req-123',
      causationId: 'cause-xyz',
      service: 'VehicleBookingService',
      domain: 'Vehicle',
    });

    // Tracer annotation uses provided causationId
    expect(tracer.putAnnotation).toHaveBeenCalledWith(
      'causationId',
      'cause-xyz',
    );
    // Logger context uses provided causationId
    expect(logger.appendKeys).toHaveBeenCalledWith({
      correlationId: 'req-123',
      causationId: 'cause-xyz',
      serviceName: 'VehicleBookingService',
    });
  });
});
