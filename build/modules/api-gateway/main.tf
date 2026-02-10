data "aws_region" "current" {}
data "aws_caller_identity" "current" {}



resource "aws_api_gateway_rest_api" "vehicle_booking_api" {
  name        = "${var.domain}-${var.domainService}-${var.environment}-api"
  description = var.api_description
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-${var.environment}-APIGateway"
  })
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



# Deployment and stage  
resource "aws_api_gateway_deployment" "vehicle_booking_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.vehicle_booking_api.id
  triggers = {
    redeploy = sha1(jsonencode([
      aws_api_gateway_resource.vehicle_booking_api_booking.id,
      aws_api_gateway_method.vehicle_booking_api_post_booking.id,
      aws_api_gateway_integration.vehicle_booking_api_post_booking_integration.id,

    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.vehicle_booking_api_post_booking_integration
  ]
}

resource "aws_api_gateway_stage" "vehicle_booking_api_stage" {
  deployment_id = aws_api_gateway_deployment.vehicle_booking_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.vehicle_booking_api.id
  stage_name    = lower(var.environment)
}


# Add permission for API Gateway to execute the Lambda functions
resource "aws_lambda_permission" "apigw_post_booking_permission" {
  statement_id  = "AllowAPIGatewayInvokeVehicleBookingServicePostBooking"
  action        = "lambda:InvokeFunction"
  function_name = var.create_vehicle_booking_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.vehicle_booking_api.id}/*"
}

