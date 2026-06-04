variable "vpc_subnet_id" {
  description = "Private Subnet id"
  type        = string
}

variable "vpc_id" {
  description = "VPC id"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
}

variable "database_host" {
  description = "Database host: MDB Atlas Cluster hostname"
  type        = string
}

variable "database_access_role_arn" {
  description = "Database access role ARN"
  type        = string
}

variable "database_name" {
  description = "The name of the database to create in MongoDB Atlas"
  type        = string
}

variable "vehicle_event_bus" {
  description = "The name of the event bus to publish to"
  type        = string
}

variable "vpc_security_group_id" {
  description = "VPC Security Group Id"
  type        = string
}

variable "environment" {
  description = "The environment using the resource"
  type        = string
}

variable "tags" {
  description = "Tags passed into the resource"
  type        = map(string)
  default     = {}
}

variable "domain" {
  description = "The domain for the project"
  type        = string
}

variable "domainService" {
  description = "The domain service for the project"
  type        = string
}

variable "expiry_date" {
  description = "The expiry date for the role in YYYY-MM-DD format"
  type        = string
}

