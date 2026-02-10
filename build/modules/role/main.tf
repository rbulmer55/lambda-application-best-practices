data "aws_caller_identity" "current" {}

resource "aws_iam_role" "mongodb_read_write_access_role" {
  name = "${var.domain}-${var.domainService}-${var.environment}-MongoDBAccessRole-${var.expiry_date}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        },
        Condition = {
          StringLike = {
            /**
              * This condition allows any principal assuming the role to have a name that starts with the pattern defined below. This is useful for allowing multiple resources (e.g., Lambda functions) to assume the same role without needing to create individual roles for each resource.
              * The pattern includes the domain, domain service, environment, and a wildcard for the function name, ensuring that only resources following this naming convention can assume the role.
              */
            "aws:PrincipalArn" = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.domain}-${var.domainService}-${var.environment}-fn-role-*"
          }
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.domain}-${var.domainService}-${var.environment}-MongoDBAccessRole-${var.expiry_date}"
  })
}
