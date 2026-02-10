output "rest_api_id" {
  value = aws_api_gateway_rest_api.vehicle_booking_api.id
}

output "api_gateway_stage" {
  value = aws_api_gateway_stage.vehicle_booking_api_stage.stage_name
}
