import { config } from '@config/config';
import { logger, tracer } from '@shared/powertools';
import { ServiceMetadata } from '@shared/types/service-metadata';
import { APIGatewayProxyEvent } from 'aws-lambda';

export function injectRequestContext(
  event: APIGatewayProxyEvent,
  causationId?: string,
): ServiceMetadata {
  const metadata: ServiceMetadata = {
    correlationId: event.requestContext.requestId,
    causationId: causationId || event.requestContext.requestId,
    service: config.get('serviceName'),
    domain: config.get('domainName'),
  };

  tracer.putAnnotation('correlationId', metadata.correlationId);
  tracer.putAnnotation('causationId', metadata.causationId);
  tracer.putAnnotation('service', metadata.service);

  logger.appendKeys({
    correlationId: metadata.correlationId,
    causationId: metadata.causationId,
    serviceName: metadata.service,
  });

  return metadata;
}
