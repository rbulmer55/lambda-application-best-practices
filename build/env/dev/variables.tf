
variable "ENVIRONMENT" {
  type        = string
  description = "Deployment environment: DEV, PRE, or PRD"
  validation {
    condition     = contains(["DEV", "TST", "PRE", "PRD"], upper(var.ENVIRONMENT))
    error_message = "ENVIRONMENT must be one of: DEV, PRE, PRD (case-insensitive)."
  }
}

variable "MONGODB_ATLAS_ORG_ID" {
  type        = string
  description = "MongoDB Atlas Organization ID"
}

variable "MONGODB_ATLAS_PROJECT_ID" {
  type        = string
  description = "MongoDB Atlas Project ID"
}

variable "MONGODB_ATLAS_PUBLIC_KEY" {
  type        = string
  description = "MongoDB Atlas Public Key"
}

variable "MONGODB_ATLAS_PRIVATE_KEY" {
  type        = string
  description = "MongoDB Atlas Private Key"
}
