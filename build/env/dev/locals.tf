locals {
  domain        = "Vehicle"
  domainService = "BookingService"
  expire_on     = "2026-02-20"
  environment   = var.ENVIRONMENT

  common_tags = {
    environment  = local.environment
    project_name = "${local.domain}-${local.domainService}"
    project-id   = "internal"
    expire_on    = local.expire_on
    owner        = "robert.bulmer@mongodb.com"
  }
}
