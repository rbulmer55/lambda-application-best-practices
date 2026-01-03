export interface ServiceMetadata {
  correlationId: string; // e.g., API Gateway requestId
  causationId: string; // optional
  service: string;
  domain: string;
}
