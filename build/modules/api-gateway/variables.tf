variable "api_description" {
  description = "API Gateway description"
  type        = string
  default     = ""
}

/**
* Variables for our lambda integration methods
*/
variable "create_vehicle_booking_lambda_arn" {
  description = "Lambda function invoke ARN"
  type        = string
}

variable "create_vehicle_booking_lambda_name" {
  description = "Lambda function name"
  type        = string
}
/** End integration method variables */

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
