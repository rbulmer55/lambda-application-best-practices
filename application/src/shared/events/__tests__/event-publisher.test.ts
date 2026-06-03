import { EventPublisher, EventDetail } from '../event-publisher';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { logger } from '@shared/powertools';

// 1. Mock the AWS SDK v3 Client and Command
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-eventbridge', () => {
  return {
    EventBridgeClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    // Mocking PutEventsCommand to simply capture the input args
    PutEventsCommand: jest.fn().mockImplementation((args) => args),
  };
});

// 2. Mock AWS Lambda Powertools
// The decorator needs to return a valid descriptor so the class compiles perfectly
jest.mock('@shared/powertools', () => ({
  tracer: {
    captureMethod: jest.fn(
      () =>
        (target: any, propertyKey: string, descriptor: PropertyDescriptor) =>
          descriptor,
    ),
  },
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('EventPublisher', () => {
  const eventBusName = 'my-test-event-bus';
  let publisher: EventPublisher;

  // Define a reusable mock event payload matching your interfaces
  const mockEvent: EventDetail<{ orderId: string }> = {
    type: 'OrderCreated',
    payload: { orderId: '12345' },
    metadata: {
      correlationId: 'corr-abc-123',
      causationId: 'caus-xyz-789',
      service: 'order-service',
      domain: 'ecommerce',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = 'us-east-1';
    publisher = new EventPublisher(eventBusName);
  });

  it('should successfully publish an event to EventBridge', async () => {
    // Arrange
    mockSend.mockResolvedValueOnce({ FailedEntryCount: 0 });

    // Act
    await publisher.publish(mockEvent);

    // Assert
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(PutEventsCommand).toHaveBeenCalledWith({
      Entries: [
        {
          EventBusName: eventBusName,
          Source: mockEvent.metadata.service,
          DetailType: mockEvent.type,
          Detail: JSON.stringify({
            orderId: '12345',
            metadata: mockEvent.metadata,
          }),
        },
      ],
    });

    expect(logger.info).toHaveBeenCalledWith('Event published to EventBridge', {
      eventType: mockEvent.type,
      metadata: mockEvent.metadata,
    });
  });

  it('should log an error if EventBridge returns a FailedEntryCount > 0', async () => {
    // Arrange
    const mockFailedResponse = {
      FailedEntryCount: 1,
      Entries: [
        { ErrorCode: 'InternalFailure', ErrorMessage: 'Something went wrong' },
      ],
    };
    mockSend.mockResolvedValueOnce(mockFailedResponse);

    // Act
    await publisher.publish(mockEvent);

    // Assert
    expect(logger.error).toHaveBeenCalledWith(
      'EventBridge failed to deliver event',
      {
        response: mockFailedResponse,
      },
    );
    // Ensure it doesn't log success if it fails
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('should log the error and rethrow it if client.send completely rejects', async () => {
    // Arrange
    const mockError = new Error('Network Error or AWS Timeout');
    mockSend.mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(publisher.publish(mockEvent)).rejects.toThrow(
      'Network Error or AWS Timeout',
    );

    expect(logger.error).toHaveBeenCalledWith('Failed to publish event', {
      eventType: mockEvent.type,
      metadata: mockEvent.metadata,
      error: mockError,
    });
  });
});
