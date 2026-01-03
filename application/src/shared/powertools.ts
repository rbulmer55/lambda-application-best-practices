import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

export const logger = new Logger({
  persistentKeys: {}, // optional default attributes
});

export const metrics = new Metrics({
  namespace: 'VehicleBookingService',
});

export const tracer = new Tracer({});
