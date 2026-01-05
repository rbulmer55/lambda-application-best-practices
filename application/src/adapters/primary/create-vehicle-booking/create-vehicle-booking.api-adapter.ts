/**
 * Middleware-enhanced adapter for completing a vehicle booking.
 */
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
/**
 * General Imports
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MetricUnit } from '@aws-lambda-powertools/metrics';

/**
 * Internal imports
 */
import { ValidationError } from '@errors/validation-error';
import { schemaValidator } from '@shared/schema-validator';
import { config } from '@config/config';
import { getHeaders } from '@shared/headers';
import { errorHandler } from '@shared/error-handler';
import { tracer, metrics, logger } from '@shared/powertools';
import {
  VehicleBookingRequestDTO,
  VehicleBookingResponseDTO,
} from '@dto/vehicle-booking-dto';
import { VehicleBookingRequestSchema } from '@schemas/vehicle-booking';
import { injectRequestContext } from '@shared/api/request-context';
import { ServiceMetadata } from '@shared/types/service-metadata';
import { createBookingUseCase } from '@use-cases/create-booking';

const stage = config.get('stage');

/**
 *
 * Primary Adapter: Create Vehicle Booking
 * Purpose: Handles the API Gateway event, validates input,
 *          invokes the create booking use case, and returns
 *          the appropriate HTTP response.
 */
export const createVehicleBookingAdapter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // Inject request context for tracing and logging
    const metadata: ServiceMetadata = injectRequestContext(event);
    // Validate input
    const { body } = event;
    if (!body) throw new ValidationError('no payload body');
    const payload = JSON.parse(body) as VehicleBookingRequestDTO;
    schemaValidator(VehicleBookingRequestSchema, payload);

    // Execute use case
    const vehicleBookingResult: VehicleBookingResponseDTO =
      await createBookingUseCase(payload, metadata);

    metrics.addMetric('BookingCreated', MetricUnit.Count, 1);

    logger.info('Vehicle booking created', {
      bookingId: vehicleBookingResult.bookingId,
    });

    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify(vehicleBookingResult),
      headers: getHeaders(stage),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('CreateVehicleBookingError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(createVehicleBookingAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
  .use(httpErrorHandler());
