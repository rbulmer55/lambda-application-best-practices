data "aws_region" "current" {}

# VPC  
resource "aws_vpc" "vehicle_booking_service_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-${var.environment}-vpc"
  })
  enable_dns_hostnames = true
  enable_dns_support   = true
}

# Private Subnet  
resource "aws_subnet" "vehicle_booking_service_private_subnet" {
  count      = 1
  vpc_id     = aws_vpc.vehicle_booking_service_vpc.id
  cidr_block = "10.0.1.0/24"
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-private-subnet-${count.index + 1}"
  })
}

# Private Route Table no egress
resource "aws_route_table" "vehicle_booking_service_private_route_table" {
  vpc_id = aws_vpc.vehicle_booking_service_vpc.id
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-private-route-table"
  })
}

resource "aws_route_table_association" "vehicle_booking_service_private_subnet_asso" {
  subnet_id      = aws_subnet.vehicle_booking_service_private_subnet[0].id
  route_table_id = aws_route_table.vehicle_booking_service_private_route_table.id
}

resource "aws_security_group" "vehicle_booking_service_vpc_sg" {
  name        = "${var.domain}-${var.domainService}-vpc-sg"
  vpc_id      = aws_vpc.vehicle_booking_service_vpc.id
  description = "Security Group for our VPC traffic with MongoDB Atlas and other resources in the VPC"

  # This allows all traffic from the VPC  
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.vehicle_booking_service_vpc.cidr_block]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.vehicle_booking_service_vpc.cidr_block]
  }
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-vpc-security-group"
  })
}

resource "aws_vpc_endpoint" "vehicle_booking_service_atlas_endpoint" {
  vpc_id              = aws_vpc.vehicle_booking_service_vpc.id
  vpc_endpoint_type   = "Interface"
  service_name        = var.mongodbatlas_private_endpoint_service_name
  subnet_ids          = [aws_subnet.vehicle_booking_service_private_subnet[0].id]
  security_group_ids  = [aws_security_group.vehicle_booking_service_vpc_sg.id]
  private_dns_enabled = false
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-mongodb-atlas-endpoint"
  })
}

resource "mongodbatlas_privatelink_endpoint_service" "vehicle_booking_service_private_endpoint_service_connection" {
  project_id          = var.mongodbatlas_project_id
  private_link_id     = var.mongodbatlas_private_endpoint_link_id
  endpoint_service_id = aws_vpc_endpoint.vehicle_booking_service_atlas_endpoint.id
  provider_name       = "AWS"
}


resource "aws_vpc_endpoint" "vehicle_booking_service_sts_endpoint" {
  vpc_id              = aws_vpc.vehicle_booking_service_vpc.id
  service_name        = "com.amazonaws.${data.aws_region.current.id}.sts"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.vehicle_booking_service_private_subnet[0].id]
  security_group_ids  = [aws_security_group.vehicle_booking_service_vpc_sg.id]
  private_dns_enabled = true
  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-sts-endpoint"
  })
}
