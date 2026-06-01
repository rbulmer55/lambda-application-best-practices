# Graceful Error & Timeout Handling

[Main Menu](../README.md#quick-links--optimisations) | [Next - Local Simulation](./local-simulation.md)

Catching errors is often left to the last minute, franticaly trying to make the code production ready, or worse debugging an issue idenfitied.

Aleviating as much complex debugging as possible, thinking about catching errors while writing the code will save time and make enterprise applications more robust.

Timeout handling prevents the code during runtime from executing indefinitely or longer than necessary. A Lambda timeout is a catch all - not a silver bullet. Each external call to third-party APIs should be limited where possible.

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

```tf
resource "aws_lambda_function" "handler" {
  function_name = "example-handler"
  timeout     = 10
  ...
}
```

### 3. Use explicit, typed errors

Prefer domain and application-level error types over generic exceptions.

At a base level:

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

Alternatively use a library already built for Error Typing.

### 4. Centralise error handling

Handlers should delegate error formatting to a shared utility. Keep handlers and adapters thin and free of common code.

```ts
...
 // throwing an error to a cetntralised function
 catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;

    return errorHandler(error);
  }
...
```

## Notes

- Central error handler: `application/src/shared/error-handler.ts` (or similar)
- Use typed errors if possible. In this example, `http-errors` NPM package.
- This pattern works well with retries, DLQs, and Step Functions

## Testing

Adding error handling and timeout management to your Lambda functions does not significantly affect raw performance. Instead, it enhances the robustness and predictability of your functions, helping to identify issues when execution fails and preventing unnecessarily long runtimes.

[Main Menu](../README.md#quick-links--optimisations) | [Next - Local Simulation](./local-simulation.md)
