data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "aws_api_gateway_rest_api" "vehicle_booking_api" {
  name        = "${var.domain}-${var.domainService}-${var.environment}-api"
  description = var.api_description
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-${var.environment}-APIGateway"
  })
}

resource "aws_cloudwatch_log_group" "api_gw_access_logs" {
  name              = "/aws/apigateway/${aws_api_gateway_rest_api.vehicle_booking_api.name}-access-logs"
  retention_in_days = 7
}

# Resource for /v1  
resource "aws_api_gateway_resource" "api_version" {
  rest_api_id = aws_api_gateway_rest_api.vehicle_booking_api.id
  parent_id   = aws_api_gateway_rest_api.vehicle_booking_api.root_resource_id
  path_part   = "v1"
}

# Resource for /v1/booking  
resource "aws_api_gateway_resource" "vehicle_booking_api_booking" {
  rest_api_id = aws_api_gateway_rest_api.vehicle_booking_api.id
  parent_id   = aws_api_gateway_resource.api_version.id
  path_part   = "booking"
}

# Resource for /v1/booking-unminified
resource "aws_api_gateway_resource" "vehicle_booking_api_booking_unminified" {
  rest_api_id = aws_api_gateway_rest_api.vehicle_booking_api.id
  parent_id   = aws_api_gateway_resource.api_version.id
  path_part   = "booking-unminified"
}

# Method: POST  /unminified
resource "aws_api_gateway_method" "vehicle_booking_api_post_booking_unminified" {
  rest_api_id   = aws_api_gateway_rest_api.vehicle_booking_api.id
  resource_id   = aws_api_gateway_resource.vehicle_booking_api_booking_unminified.id
  http_method   = "POST"
  authorization = "NONE"
}

# Method: POST 
resource "aws_api_gateway_method" "vehicle_booking_api_post_booking" {
  rest_api_id   = aws_api_gateway_rest_api.vehicle_booking_api.id
  resource_id   = aws_api_gateway_resource.vehicle_booking_api_booking.id
  http_method   = "POST"
  authorization = "NONE"
}

# Lambda Integration  
resource "aws_api_gateway_integration" "vehicle_booking_api_post_booking_integration" {
  rest_api_id             = aws_api_gateway_rest_api.vehicle_booking_api.id
  resource_id             = aws_api_gateway_resource.vehicle_booking_api_booking.id
  http_method             = aws_api_gateway_method.vehicle_booking_api_post_booking.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.create_vehicle_booking_lambda_arn
}

resource "aws_api_gateway_integration" "vehicle_booking_api_post_booking_unminified_integration" {
  rest_api_id             = aws_api_gateway_rest_api.vehicle_booking_api.id
  resource_id             = aws_api_gateway_resource.vehicle_booking_api_booking_unminified.id
  http_method             = aws_api_gateway_method.vehicle_booking_api_post_booking_unminified.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.create_vehicle_booking_unminified_lambda_arn
}




# Deployment and stage  
resource "aws_api_gateway_deployment" "vehicle_booking_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.vehicle_booking_api.id
  triggers = {
    redeploy = sha1(jsonencode([
      aws_api_gateway_resource.vehicle_booking_api_booking.id,
      aws_api_gateway_method.vehicle_booking_api_post_booking.id,
      aws_api_gateway_integration.vehicle_booking_api_post_booking_integration.id,
      aws_api_gateway_resource.vehicle_booking_api_booking_unminified.id,
      aws_api_gateway_method.vehicle_booking_api_post_booking_unminified.id,
      aws_api_gateway_integration.vehicle_booking_api_post_booking_unminified_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.vehicle_booking_api_post_booking_integration,
    aws_api_gateway_integration.vehicle_booking_api_post_booking_unminified_integration
  ]
}

resource "aws_api_gateway_stage" "vehicle_booking_api_stage" {
  deployment_id = aws_api_gateway_deployment.vehicle_booking_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.vehicle_booking_api.id
  stage_name    = lower(var.environment)

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw_access_logs.arn
    format = jsonencode({
      requestId               = "$context.requestId",
      sourceIp                = "$context.identity.sourceIp",
      caller                  = "$context.identity.caller",
      user                    = "$context.identity.user",
      requestTime             = "$context.requestTime",
      httpMethod              = "$context.httpMethod",
      resourcePath            = "$context.resourcePath",
      status                  = "$context.status",
      protocol                = "$context.protocol",
      responseLength          = "$context.responseLength",
      integrationStatus       = "$context.integration.status",
      integrationLatency      = "$context.integration.latency",
      integrationErrorMessage = "$context.integration.errorMessage",
      errorResponseType       = "$context.error.responseType",
      errorMessage            = "$context.error.message"
    })
  }

  depends_on = [
    aws_api_gateway_account.global
  ]
}

resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.vehicle_booking_api.id
  stage_name  = aws_api_gateway_stage.vehicle_booking_api_stage.stage_name
  method_path = "*/*" # Enforces logging for all paths and methods

  settings {
    logging_level      = "INFO" # Captures routing paths, authorizers, and invocation steps
    data_trace_enabled = true   # Logs full request/response bodies (Disable in Prod if PII is sensitive)
    metrics_enabled    = true
  }

  depends_on = [
    aws_api_gateway_account.global
  ]
}

# Add permission for API Gateway to execute the Lambda functions
resource "aws_lambda_permission" "apigw_post_booking_permission" {
  statement_id  = "AllowAPIGatewayInvokeVehicleBookingServicePostBooking"
  action        = "lambda:InvokeFunction"
  function_name = var.create_vehicle_booking_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.vehicle_booking_api.id}/*"
}

resource "aws_lambda_permission" "apigw_post_booking_unminified_permission" {
  statement_id  = "AllowAPIGatewayInvokeVehicleBookingServicePostBookingUnminified"
  action        = "lambda:InvokeFunction"
  function_name = var.create_vehicle_booking_unminified_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.vehicle_booking_api.id}/*"
}


resource "aws_api_gateway_account" "global" {
  cloudwatch_role_arn = aws_iam_role.api_gw_cloudwatch.arn
}

resource "aws_iam_role" "api_gw_cloudwatch" {
  name = "${var.domain}-${var.environment}-apigw-cloudwatch-global"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_gw_cloudwatch" {
  role       = aws_iam_role.api_gw_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}
