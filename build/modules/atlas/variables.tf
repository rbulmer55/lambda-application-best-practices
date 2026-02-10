variable "environment" {
  description = "The environment using the resource"
  type        = string
}

variable "domain" {
  description = "The domain for the project"
  type        = string
}

variable "domainService" {
  description = "The domain service for the project"
  type        = string
}

variable "region" {
  description = "Atlas region"
  type        = string
  default     = "EU_WEST_2"
}

variable "cloud_provider" {
  description = "Atlas Cloud Provider"
  type        = string
  default     = "AWS"
}

variable "mongodbatlas_access_role_arn" {
  description = "role arn for the user"
  type        = string

}

variable "mongodbatlas_org_id" {
  description = "MongoDB Atlas Organization ID"
  type        = string
}

variable "mongodbatlas_project_id" {
  description = "MongoDB Atlas Project ID"
  type        = string
  default     = ""
}

variable "cluster_tier" {
  description = "The cluster tier to use for the Atlas cluster"
  type        = string
  default     = "M10"
  validation {
    condition     = contains(["M10", "M20", "M30"], upper(var.cluster_tier))
    error_message = "cluster_tier must be one of: M10, M20, M30 (case-insensitive)."
  }
}

