# Separate Handler from Business Logic

Use code architecture patterns such as hexagonal architecture and the concept of ports, adapters and domain use cases to distinguish distinct boundaries between business logic and tooling.

## Why it matters

- Keeps Lambda handlers thin and focused on event/response translation.
- Makes business logic testable outside of the Lambda runtime.
- Improves reusability and readability (use-cases and adapters).

## Architectural Principle

Handlers are adapters — not application logic.

- Handler: Translates AWS events into application inputs

- Use case: Encapsulates business rules and orchestration

- Adapters: Integrate with AWS, databases, HTTP, queues, etc.

```
Lambda Event
   ↓
Handler (adapter)
   ↓
Use Case (domain logic)
   ↓
Ports → Infrastructure adapters
```

## Recommendations

### 1. Keep handlers minimal

Handlers should:

- Parse the event

- Call a use case

- Format the response

Avoid:

- Business rules

- Heavy imports

- SDK clients created per invocation

### 2. Organize code by responsibility

Recommended structure:

```
application/
├─ entry-points/
│  └─ health-check-lambda.ts
├─ src/
│  ├─ use-cases/
│  │  └─ health-check/
│  │     └─ health-check.ts
│  ├─ ports/
│  └─ adapters/
```

### 3. Write Lambda-agnostic use cases

Use cases should:

- Accept plain inputs

- Return plain outputs

- Have no dependency on AWS event types

This allows:

- Fast unit tests

- Reuse across handlers, CLIs, or batch jobs

### 4. Test use cases independently

Unit test use cases without Lambda event mocks.

Test handlers separately for event/response mapping

## Examples in this repo

- Handler examples: `application/entry-points/health-check-lambda.ts`
- Use-case pattern: `application/src/use-cases/health-check/health-check.ts`

## Notes

- Avoid long-running initialization inside handler files

- Prefer dependency injection at the adapter boundary

- This pattern pairs well with Lambda Power Tuning and bundle size optimizations

## References

AWS TypeScript handler best practices:
https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html#typescript-best-practices

Clean Serverless Code example:
https://github.com/leegilmorecode/clean-serverless-code.git
