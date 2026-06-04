output "vehicle_event_bus_arn" {
  description = "The ARN of the Vehicle Event Bus"
  value       = aws_cloudwatch_event_bus.vehicle_bus.arn
}

output "vehicle_event_bus_name" {
  description = "The Name of the Vehicle Event Bus"
  value       = aws_cloudwatch_event_bus.vehicle_bus.name
}
