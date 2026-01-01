# Monitor & Log

## Why it matters

- Observability is critical for troubleshooting production issues

- Enables capacity planning and performance tuning

- Provides evidence for SLA/SLO compliance

- Reduces MTTR by making failures actionable

## Recommendations

### 1. Emit structured logs

Use structured (JSON) logs instead of free-text messages.

Logs should include:

- level (info, warn, error)
- message
- requestId (from Lambda context)
- service / functionName

Relevant domain identifiers (userId, orderId, etc.)

```js
logger.info('Order Created Successfully', {
  requestId,
  durationMs,
  result: 'success',
});
```

Structured logs improve:

- CloudWatch Logs Insights queries
- Correlation across services
- Alert accuracy

**Preferred tooling**

@aws-lambda-powertools/logger for structured, contextual logging

### 2. Capture meaningful metrics

Emit metrics for signals that indicate health and saturation, not just errors.

Recommended metrics:

- Latency (p50 / p90 / p99)
- Error count and rate
- Timeouts
- Retry count
- DB connection count / pool exhaustion
- Throttling events

Use: CloudWatch Embedded Metrics Format (EMF)or an external metrics backend (Datadog, New Relic, etc.)

**Preferred tooling**

@aws-lambda-powertools/metrics for EMF-compatible metrics

### 3. Centralize logging and metrics

Send logs to CloudWatch Logs or a centralized logging platform and Standardize log format across all Lambdas

Create dashboards for:

- Error rate
- Latency
- Invocation count
- Throttles and concurrency

### 4. Instrument health checks and control paths

Add visibility to:

- Health check endpoints
- Throttling decisions
- Retry attempts and backoff
- Circuit breaker or fail-fast paths

These signals help explain why traffic is degraded, not just that it is.

### 5. Add distributed tracing

Enable tracing to follow requests across services and identify latency bottlenecks.

Use tracing to:

- Visualize end-to-end request flows

- Identify slow dependencies

- Correlate logs and metrics

**Preferred tooling**

@aws-lambda-powertools/tracer (integrates with AWS X-Ray)

### 5. Alert on symptoms, not noise

Create alerts on:

- Sustained error rates

- Latency SLO violations

- Repeated timeouts

- Connection pool exhaustion

Avoid:

- Alerting on every single error
- Alerts without clear owner or action

## Example

### Shared Logger

```ts
// application/src/shared/logger.ts
import { Logger } from '@aws-lambda-powertools/logger';

export const logger = new Logger({
  serviceName: 'orders-service',
});
```

Usage:

```ts
logger.info('Order created successfully', {
  requestId,
  orderId,
});
```

Recommended Dependencies:

- [@aws-lambda-powertools/logger](https://www.npmjs.com/package/@aws-lambda-powertools/logger)
- [@aws-lambda-powertools/metrics](https://www.npmjs.com/package/@aws-lambda-powertools/metrics)
- [@aws-lambda-powertools/tracer](https://www.npmjs.com/package/@aws-lambda-powertools/tracer)
