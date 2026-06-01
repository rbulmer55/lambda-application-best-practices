# Memory Sizing and CPU

[Main Menu](../README.md#quick-links--optimisations) | [Next - Error Handling](./graceful-error-timeout-handling.md)

## Why it matters

- In AWS Lambda, memory size directly controls available CPU.

- Increasing memory often reduces execution time disproportionately, especially for CPU-bound workloads.

Right-sizing can lower total cost even when per-ms pricing increases.

## Recommendations

### 1. Understand the workload

Before increasing memory, determine whether the function is:

- CPU-bound (JSON processing, compression, crypto, image transforms)

- I/O-bound (network calls, DB queries, S3 reads/writes)

> CPU-bound functions benefit most from higher memory.

### 2. Profile before and after

Measure:

- Duration (p50 / p90 / p99)

- Billed duration

- Cost per invocation

Compare results at multiple memory levels (e.g. 256 → 512 → 1024 MB)

**AWS tools:**

- CloudWatch Logs + Insights

- AWS Lambda Power Tuning (Step Functions-based)

### 3. Increase memory conservatively

Recommended approach:

- Start with a modest bump (e.g. +256 MB)

- Measure latency and cost impact

- Stop increasing once gains flatten

> Doubling memory often yields diminishing returns after CPU saturation.

Typically as a finger in the air, **for production single purpose functions I start with 1 GB of memory**. While this may seem a large jump from the default size of 128 MB, in majority of cases runtime is reduced and the change is more cost effective.

### 4. Use environment-specific sizing

Avoid one-size-fits-all settings:

- Dev/test: lower memory, slower execution is acceptable

- UAT: production-like sizing for realism

- Prod: optimised for latency and cost

Document the rationale in Architectural Decision Records (ADRs) so future changes are intentional.

## Examples

- Adjust memory in your infrastructure code under `build/modules/functions/{x}/main.tf` or the Terraform module used in this repo.
- Alternatively, override memory size for environments using configuration parameters but note some IAC tools will overwrite these changes.

```tf
resource "aws_lambda_function" "handler" {
  function_name = "example-handler"
  runtime       = "nodejs18.x"
  handler       = "index.handler"

  memory_size = var.lambda_memory_mb
  timeout     = 10
}
```

```tf
# variables.tf
variable "lambda_memory_mb" {
  description = "Lambda memory size (controls CPU allocation)"
  type        = number
  default     = 512
}
```

```tf
# prod.tfvars
lambda_memory_mb = 1024
```

## Resources

Check out James Eastham’s video on reducing Lambda cold start times and improving performance with the .NET runtime. In this excellent explanation, he demonstrates the relationship between memory allocation and Lambda performance.

[Youtube Link - https://youtu.be/roIIujtLaQ4?si=JDlEoU_FJ7jGsrxp](https://youtu.be/roIIujtLaQ4?si=JDlEoU_FJ7jGsrxp)

## Testing

Lambda Power Tuning is an invaluable tool for determining the optimal memory allocation for your Lambda functions.

For this test, we will compare performance across memory configurations of 128 MB, 256 MB, and 1 GB to observe the differences in execution speed and efficiency.

**TODO**

[Main Menu](../README.md#quick-links--optimisations) | [Next - Error Handling](./graceful-error-timeout-handling.md)
