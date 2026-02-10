resource "mongodbatlas_project" "project" {
  count  = var.mongodbatlas_project_id == "" ? 1 : 0
  name   = "${var.domain}-${var.domainService}-${var.environment}"
  org_id = var.mongodbatlas_org_id
}

resource "mongodbatlas_cluster" "cluster" {
  project_id   = var.mongodbatlas_project_id != "" ? var.mongodbatlas_project_id : mongodbatlas_project.project[0].id
  name         = "${var.domainService}-${var.environment}"
  cluster_type = "REPLICASET"
  replication_specs {
    num_shards = 1
    regions_config {
      region_name     = var.region
      electable_nodes = 3
      priority        = 7
      read_only_nodes = 0
    }
  }
  cloud_backup                 = false
  auto_scaling_disk_gb_enabled = true
  provider_name                = var.cloud_provider
  provider_instance_size_name  = var.cluster_tier

  depends_on = [mongodbatlas_project.project]
}

resource "mongodbatlas_privatelink_endpoint" "aws" {
  project_id    = var.mongodbatlas_project_id != "" ? var.mongodbatlas_project_id : mongodbatlas_project.project[0].id
  provider_name = var.cloud_provider
  region        = var.region
}


resource "mongodbatlas_database_user" "mdb_iam_user" {
  project_id         = var.mongodbatlas_project_id != "" ? var.mongodbatlas_project_id : mongodbatlas_project.project[0].id
  username           = var.mongodbatlas_access_role_arn
  auth_database_name = "$external"
  aws_iam_type       = "ROLE"

  roles {
    role_name     = "readWriteAnyDatabase"
    database_name = "admin"
  }
}
