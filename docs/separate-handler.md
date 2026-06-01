# Separate Handler from Business Logic

[Main Menu](../README.md#quick-links--optimisations) | [Next - Minify Packages](./minify-packages.md)

Being relaxed when writing code can lead to maintenance and extensibility problems with enterprise applications.

Learning to use code architecture patterns such as **hexagonal architecture** can improve and stabilise the code as it grows and makes it easier and cost effective for the business to implement new features.

Hexagonal architecutre uses the concept of **ports, adapters and domain entities or use-cases** to distinguish distinct boundaries between business logic and tooling.

Using this pattern can also help with being technology agnostic, making it easier to transpose your code onto another cloud or service with **reduced risk**.

## Why it matters

- Keeps Lambda handlers thin and focused on event/response translation.
- Makes business logic testable outside of the Lambda runtime.
- Improves reusability and readability (use-cases and adapters).

## Architectural Principle

Handlers are adapters — not application logic.

> **NOTE**
> Many people who build with ephemeral services start with writing multipurpose functions **A.K.A Lambdaliths**. These type of functions get you started quickly but are problematic to scale, debug and extend.

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

### 2. Organise code by responsibility

Recommended structure:

```
application/
├─ entry-points/
│  └─ health-check-lambda.ts
├─ src/
│  ├─ use-cases/
│  │  └─ health-check/
│  │     └─ health-check.ts
│  └─ adapters/
│     └─ primary/
│     └─ secondary/

```

#### Definitons

- **/entry-points**, these are insignificant for the architectural pattern however help with our terrform example. These provide a more maintainable build script in `./build.js`
- **/src/use-cases** provide our core buisiness logic, here we implment only code that matters to our company. **Do not** bleed infrastructure concerns into this.
- **/src/adapters/primary**, Primary Adapters are our incoming infrastructure concerns. For Example an API Gateway method integration request or S3 Bucket Object Trigger.
- **/src/adapters/seconadary**, Secondary Adapters are our outbound infrastructure concerns. For Example writing to an SQS queue or an EventBridge bus.

### 3. Write Lambda-agnostic use cases

Use cases should:

- Accept plain inputs

- Return plain outputs

- Have no dependency on AWS event types

This allows:

- Fast unit tests

- Reuse across handlers, CLIs, or batch jobs

- Transferability to other clouds or container architectures

### 4. Test use cases independently

Unit test use-cases without Lambda event mocks.

Test adapters separately for event/response mapping

## Examples in this repo

- Adapter examples: `application/src/adapters/primary/create-vehicle-booking/create-vehicle-booking.api-adapter.ts`
- Use-case pattern: `application/src/use-cases/create-booking/create-booking.use-case.ts`

## Notes

- Avoid long-running initialisation inside handler files

- Prefer dependency injection at the adapter boundary

- This pattern pairs well with Lambda Power Tuning and bundle size optimisations

## References

AWS TypeScript handler best practices:
https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html#typescript-best-practices

Clean Serverless Code example from AWS Serverless Hero Lee Gilmore:
https://github.com/leegilmorecode/clean-serverless-code.git

## Testing

Separating the Lambda handler from the business logic does not affect performance testing. The benefits of this change are less about speed and more about maintainability and long-term code sustainability.

[Main Menu](../README.md#quick-links--optimisations) | [Next - Minify Packages](./minify-packages.md)
