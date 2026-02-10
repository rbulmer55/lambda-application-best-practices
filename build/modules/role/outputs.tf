output "role_arn" {
  description = "MDB Access Role Arn"
  value       = aws_iam_role.mongodb_read_write_access_role.arn
}
