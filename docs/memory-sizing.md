# Memory Sizing and CPU

## Why it matters

- In AWS Lambda, memory size directly controls available CPU.

- Increasing memory often reduces execution time disproportionately, especially for CPU-bound workloads.

Proper right-sizing can lower total cost even when per-ms pricing increases.

## Recommendations

### 1. Understand the workload

Before increasing memory, determine whether the function is:

- CPU-bound (JSON processing, compression, crypto, image transforms)

- I/O-bound (network calls, DB queries, S3 reads/writes)

CPU-bound functions benefit most from higher memory.

### 2. Profile before and after

Measure:

- Duration (p50 / p90 / p99)

- Billed duration

- Cost per invocation

Compare results at multiple memory levels (e.g. 256 → 512 → 1024 MB)

AWS tools:

- CloudWatch Logs + Insights

- AWS Lambda Power Tuning (Step Functions-based)

### 3. Increase memory conservatively

Recommended approach:

- Start with a modest bump (e.g. +256 MB)

- Measure latency and cost impact

- Stop increasing once gains flatten

> Doubling memory often yields diminishing returns after CPU saturation.

### 4. Use environment-specific sizing

Avoid one-size-fits-all settings:

- Dev: lower memory, slower execution is acceptable

- Test: production-like sizing for realism

- Prod: optimized for latency and cost

Document the rationale so future changes are intentional.

## Examples

- Adjust memory in your infrastructure code under `build/modules/functions/` or the Terraform module used in this repo.
- Alternatively, override memory size for environments using configuration parameters.

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
