output "vpc_prv_subnet_id" {
  description = "Private VPC Subnet"
  value       = aws_subnet.vehicle_booking_service_private_subnet[0].id
}

output "vpc_id" {
  description = "Application VPC"
  value       = aws_vpc.vehicle_booking_service_vpc.id
}

output "vpc_cidr" {
  description = "VPC CIDR"
  value       = aws_vpc.vehicle_booking_service_vpc.cidr_block
}

output "vpc_security_group_id" {
  description = "VPC Security Group"
  value       = aws_security_group.vehicle_booking_service_vpc_sg.id
}
