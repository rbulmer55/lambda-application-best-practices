module "vehicle_booking_role" {
  source        = "../../modules/role"
  environment   = local.environment
  domain        = local.domain
  domainService = local.domainService
  expiry_date   = local.expire_on
  tags          = local.common_tags
}



module "vehicle_booking_database" {
  providers = {
    mongodbatlas = mongodbatlas
  }
  source                       = "../../modules/atlas"
  environment                  = local.environment
  domain                       = local.domain
  domainService                = local.domainService
  mongodbatlas_access_role_arn = module.vehicle_booking_role.role_arn
  mongodbatlas_org_id          = var.MONGODB_ATLAS_ORG_ID
  mongodbatlas_project_id      = var.MONGODB_ATLAS_PROJECT_ID
  region                       = "EU_WEST_2"
  cloud_provider               = "AWS"
  cluster_tier                 = "M10"

  depends_on = [module.vehicle_booking_role]
}


module "vehicle_booking_vpc" {
  source                                     = "../../modules/vpc"
  environment                                = local.environment
  domain                                     = local.domain
  domainService                              = local.domainService
  mongodbatlas_private_endpoint_service_name = module.vehicle_booking_database.private_endpoint_service_name
  mongodbatlas_private_endpoint_link_id      = module.vehicle_booking_database.private_endpoint_link_id
  mongodbatlas_project_id                    = module.vehicle_booking_database.cluster_project_id

  tags = local.common_tags

  depends_on = [module.vehicle_booking_database]
}


module "create_vehicle_booking_function" {
  environment              = local.environment
  domain                   = local.domain
  domainService            = local.domainService
  expiry_date              = local.expire_on
  source                   = "../../modules/functions/create-vehicle-booking/create-vehicle-booking"
  vpc_cidr                 = module.vehicle_booking_vpc.vpc_cidr
  vpc_id                   = module.vehicle_booking_vpc.vpc_id
  vpc_subnet_id            = module.vehicle_booking_vpc.vpc_prv_subnet_id
  vpc_security_group_id    = module.vehicle_booking_vpc.vpc_security_group_id
  database_host            = module.vehicle_booking_database.cluster_private_srv
  database_access_role_arn = module.vehicle_booking_role.role_arn

  tags = local.common_tags

  depends_on = [module.vehicle_booking_vpc]
}


module "vehicle_booking_rest_api" {
  environment     = local.environment
  domain          = local.domain
  domainService   = local.domainService
  source          = "../../modules/api-gateway"
  api_description = "API for vehicle booking service operations"
  /**
  * The ARNs and Names of the Lambda functions for the API Gateway integration methods
  */
  create_vehicle_booking_lambda_arn  = module.create_vehicle_booking_function.invoke_arn
  create_vehicle_booking_lambda_name = module.create_vehicle_booking_function.function_name

  tags = local.common_tags

  depends_on = [module.create_vehicle_booking_function]
}


