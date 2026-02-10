
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
