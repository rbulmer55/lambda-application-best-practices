# Local Simulation

[Main Menu](../README.md)

## Why it matters

- Reduces feedback and iteration time during development

- Catches configuration and integration issues early

- Increases confidence before deploying to shared environments

## Recommendations

### 1. Simulate Lambda locally

Use tools that approximate the Lambda runtime and event model:

- AWS SAM (sam local invoke, sam local start-api)

- serverless-offline

- Lightweight local harnesses (Node scripts invoking handlers directly)

Local runs should:

- Load environment variables

- Use realistic event payloads

- Approximate timeouts and memory limits

### 2. Support remote invocation

Local simulation does not fully replicate:

- IAM execution roles

- VPC networking

- Cross-service AWS integrations

For these cases, invoke deployed Lambdas remotely using:

- AWS CLI (aws lambda invoke)

- AWS Toolkit for VS Code (Remote Invoke)

Use real event payloads from production or staging. Prefer staging environments for repeated testing.

Remote invocation helps validate:

- IAM permissions

- VPC access (RDS, ElastiCache, private APIs)

- Service-to-service integrations

### 3. Enable remote debugging (when needed)

For complex, environment-specific issues, use Lambda Remote Debugging via the AWS Toolkit for VS Code.

This allows you to:

- Attach a debugger to a Lambda running in the cloud

- Debug code in the real IAM role and VPC context

- Step through execution across AWS service calls

### 4. Provide an easy local entry point

Make local testing obvious and repeatable:

- Add scripts to package.json

- Document a single “happy path” command

- Optionally include a Dockerfile to match the Lambda runtime

```json
{
  "scripts": {
    "local:invoke": "sam local invoke ExampleFunction -e events/example.json",
    "local:api": "sam local start-api",
    "remote:invoke": "aws lambda invoke --function-name example out.json"
  }
}
```

### 5. Mock external dependencies in unit tests

For fast, deterministic tests:

- Mock HTTP services, queues, and SDK clients

- Use in-memory or fake adapters for databases

Unit tests should:

- Exercise use cases and domain logic

- Avoid real network calls

### 6. Add integration tests where it matters

Complement unit tests with:

- Integration tests against a local DB (Docker) or a dedicated staging AWS environment

Keep integration tests:

- Explicit (opt-in via script or tag)

- Isolated from developer machines

## Notes

For more information on AWS remote debugging see [https://aws.amazon.com/blogs/compute/accelerating-local-serverless-development-with-console-to-ide-and-remote-debugging-for-aws-lambda/](https://aws.amazon.com/blogs/compute/accelerating-local-serverless-development-with-console-to-ide-and-remote-debugging-for-aws-lambda/)
