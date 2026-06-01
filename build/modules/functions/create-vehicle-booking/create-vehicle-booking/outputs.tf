output "invoke_arn" {
  description = "arn of the lambda function"
  value       = aws_lambda_function.create_vehicle_booking_function.invoke_arn
}

output "function_name" {
  description = "name of the function"
  value       = aws_lambda_function.create_vehicle_booking_function.function_name
}


output "invoke_arn_unminified" {
  description = "arn of the lambda function"
  value       = aws_lambda_function.create_vehicle_booking_function_unminified.invoke_arn
}

output "function_name_unminified" {
  description = "name of the function"
  value       = aws_lambda_function.create_vehicle_booking_function_unminified.function_name
}
