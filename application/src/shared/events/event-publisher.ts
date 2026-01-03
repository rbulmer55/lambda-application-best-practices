import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { tracer, logger } from '@shared/powertools';

export interface EventMetadata {
  correlationId: string; // required
  causationId: string; // required
  service: string; // required
  domain: string; // required
}

export interface EventDetail<T = any> {
  type: string;
  payload: T;
  metadata: EventMetadata; // required now
}

export class EventPublisher {
  private client: EventBridgeClient;
  private eventBusName: string;

  constructor(eventBusName: string) {
    this.client = new EventBridgeClient({ region: process.env.AWS_REGION });
    this.eventBusName = eventBusName;
  }

  /**
   * Publish an event to EventBridge
   * metadata is required for correlation and tracing
   */
  @tracer.captureMethod({ subSegmentName: 'EventBridge.PublishEvent' })
  async publish<T>(event: EventDetail<T>): Promise<void> {
    const metadata = event.metadata; // must be provided

    const entry = {
      EventBusName: this.eventBusName,
      Source: metadata.service,
      DetailType: event.type,
      Detail: JSON.stringify({
        ...event.payload,
        metadata,
      }),
    };

    try {
      const response = await this.client.send(
        new PutEventsCommand({ Entries: [entry] }),
      );

      if (response.FailedEntryCount && response.FailedEntryCount > 0) {
        logger.error('EventBridge failed to deliver event', { response });
      } else {
        logger.info('Event published to EventBridge', {
          eventType: event.type,
          metadata,
        });
      }
    } catch (err) {
      logger.error('Failed to publish event', {
        eventType: event.type,
        metadata,
        error: err,
      });
      throw err;
    }
  }
}
