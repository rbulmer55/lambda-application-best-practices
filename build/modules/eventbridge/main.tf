resource "aws_cloudwatch_event_bus" "vehicle_bus" {
  name = "${var.environment}-VehicleBus"

  tags = merge(var.tags, {
    Name = "${var.environment}-VehicleBus"
  })
}
