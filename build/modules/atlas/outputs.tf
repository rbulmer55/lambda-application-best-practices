output "private_endpoint_service_name" {
  description = "Atlas Private Endpoint Service"
  value       = mongodbatlas_privatelink_endpoint.aws.endpoint_service_name
}

output "private_endpoint_link_id" {
  description = "Atlas Private Endpoint link Id"
  value       = mongodbatlas_privatelink_endpoint.aws.private_link_id
}

output "cluster_name" {
  value = mongodbatlas_cluster.cluster.name
}

output "cluster_private_srv" {
  value = mongodbatlas_cluster.cluster.connection_strings[0].private_srv
}

output "cluster_project_id" {
  value = mongodbatlas_cluster.cluster.project_id
}
