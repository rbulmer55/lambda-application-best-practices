# Graceful Error & Timeout Handling

[Main Menu](../README.md#quick-links--optimisations)

## Why it matters

- Prevents silent or partial failures

- Enables safe retries and predictable behavior

- Keeps user-facing responses consistent

- Makes production issues observable and actionable

## Recommendations

### 1. Fail fast on unrecoverable errors

- Validate inputs early

- Throw immediately on configuration or contract violations

- Avoid swallowing exceptions

Unrecoverable errors should:

- Stop execution quickly

- Be logged clearly

- Surface through metrics/alerts

### 2. Align timeouts across the stack

Lambda may terminate execution abruptly if downstream timeouts exceed its own.

Rule of thumb

`DB / HTTP timeout < Lambda timeout`

Example:

```
Lambda timeout: 10s
HTTP client timeout: 3–5s
DB query timeout: 2–4s
```

This ensures errors are returned gracefully instead of being cut off.

### 3. Use explicit, typed errors

Prefer domain and application-level error types over generic exceptions.

```ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 500,
  ) {
    super(message);
  }
}
```

Examples:

- `VALIDATION_ERROR`
- `DEPENDENCY_TIMEOUT`
- `NOT_FOUND`
- `UNAUTHORIZED`

### 4. Centralize error handling

Handlers should delegate error formatting to a shared utility.

```ts
// application/src/shared/error-handler.ts
import { AppError } from './app-error';

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: error.code,
        message: error.message,
      }),
    };
  }

  console.error('Unhandled error', error);

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: 'Unexpected error occurred',
    }),
  };
}
```

### 5. Keep handlers thin

```ts
export const handler = async () => {
  try {
    return await executeUseCase();
  } catch (error) {
    return handleError(error);
  }
};
```

### 6. Use structured logging

Log context, not just messages.

```ts
console.error('Dependency call failed', {
  service: 'payments',
  timeoutMs: 3000,
  requestId: process.env.AWS_REQUEST_ID,
});
```

This improves:

- CloudWatch Insights queries

- Correlation across services

- Alert accuracy

## Notes

- Central error handler: `application/src/shared/error-handler.ts` (or similar)

- This pattern works well with retries, DLQs, and Step Functions
