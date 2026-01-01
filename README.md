# AWS Lambda Best Practices (Part 1 - Application)

```
Author: Robert Bulmer
Date: 12/25
```

> [!IMPORTANT]
> This guide is for learning purposes only. All examples given here should be tested and used at your own risk.

## Introduction

This document captures practical best practices for building and operating AWS Lambda functions. It is intended for engineers and SREs working on serverless TypeScript services who want reliable, cost-effective, and maintainable database-backed Lambdas.

### Goals

- **Purpose**

  - Provide concise, actionable guidance covering:

  - Connection handling and pooling

  - Performance tuning (memory, timeouts)

  - Packaging and cold-start reduction

  - Operational readiness and observability

- **Audience**
  Backend engineers, DevOps/SREs, and reviewers maintaining or operating serverless workloads.

- **Scope**

- Runtime and deployment practices (connection caching, timeouts, memory sizing, packaging)

- Application architecture (separating handlers from business logic)

- Observability and operational concerns

This guide does not replace security policies—always follow your organization’s standards for secrets management, IAM, and networking.

- **How to use this guide**

- Read the numbered sections for quick rules of thumb

- Refer to the application/ directory for concrete examples implemented in this repository

The guidance emphasizes pragmatic changes (e.g., connection reuse, short timeouts, minimal bundles) that typically deliver the largest reliability and cost improvements for serverless applications.

## Quick Links — Optimisations

### Application

- [1 - Separate Handler from Business Logic](./docs/separate-handler.md)
- [2 - Minify Packages](./docs/minify-packages.md)
- [3 - Memory Sizing and CPU](./docs/memory-sizing.md)
- [4 - Graceful error & timeout handling](./docs/graceful-error-timeout-handling.md)
- [5 - Local simulation](./docs/local-simulation.md)
- [6 - Monitor & log](./docs/monitor-and-log.md)

## Part 2 - Database (Coming Soon)

### Database

- 7 - Connection Management (Caching)
- 8 - Native driver
- 9 - Max Idle Time
- 10 - Indexed queries & projection
- 11 - Limit payloads / response
- 12 - $currentOp & diagnostics
- 13 - PrivateLink & VPC

## Part 3 - Configuration & Deployment (Coming Soon)

### Configuration & Deployment

- 14 - Environment variables & Secrets
- 15 - Function URLs & API Gateway
- 16 - Provisioned Concurrency
- 17 - Warm-up & Provisioned concurrency
- 18 - Short timeouts(./docs/short-timeouts.md)

## Notes on Design Philosophy

- AWS Lambda (and other FaaS platforms) are ephemeral compute environments

- Functions should be:

  - Stateless

  - Fast to initialize

  - Explicit about timeouts and failure modes

- Database and network behavior must be tuned with ephemerality in mind
