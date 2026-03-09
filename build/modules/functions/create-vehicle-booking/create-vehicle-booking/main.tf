
resource "aws_iam_role" "create_vehicle_booking_lambda_role" {
  name               = "${var.domain}-${var.domainService}-${var.environment}-fn-role-CreateVehBooking-${var.expiry_date}"
  assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "lambda.amazonaws.com"
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOF
}

resource "aws_iam_policy" "create_vehicle_booking_lambda_role_policy" {

  name        = "${var.domain}-${var.domainService}-${var.environment}-fn-policy-CreateVehBooking-${var.expiry_date}"
  path        = "/"
  description = "AWS IAM Policy for managing the aws lambda role"
  policy      = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
    {
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
   },
   {
      "Effect": "Allow",
      "Action": [
          "ec2:DescribeNetworkInterfaces",
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    },
    {  
        "Effect": "Allow",
        "Action": [  
          "sts:AssumeRole",  
          "sts:GetCallerIdentity"  
        ] ,
        "Resource": "*"  
    }
 ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "function_attach_policy_to_role" {
  role       = aws_iam_role.create_vehicle_booking_lambda_role.name
  policy_arn = aws_iam_policy.create_vehicle_booking_lambda_role_policy.arn
}

data "archive_file" "zip_create_vehicle_booking" {
  type        = "zip"
  source_file = "${path.module}/../../dist/create-vehicle-booking.lambda.js"
  output_path = "${path.module}/create-vehicle-booking.lambda.zip"
}

resource "aws_lambda_function" "create_vehicle_booking_function" {
  filename         = data.archive_file.zip_create_vehicle_booking.output_path
  function_name    = "${var.domain}-${var.domainService}-${var.environment}-CreateVehicleBooking"
  role             = aws_iam_role.create_vehicle_booking_lambda_role.arn
  handler          = "create-vehicle-booking-lambda.handler"
  runtime          = "nodejs24.x"
  depends_on       = [aws_iam_role_policy_attachment.function_attach_policy_to_role]
  source_code_hash = data.archive_file.zip_create_vehicle_booking.output_base64sha256
  timeout          = 10
  memory_size = 128 # Adjust memory size as needed
  vpc_config {
    subnet_ids         = [var.vpc_subnet_id]
    security_group_ids = [var.vpc_security_group_id]
  }
  environment {
    variables = {
      DB_ACCESS_ROLE_ARN : var.database_access_role_arn
      DB_NAME : var.domain
      DB_CLUSTER_HOST_SRV : var.database_host
    }
  }
  tags = var.tags
}

### Unminified version for testing purposes
data "archive_file" "zip_create_vehicle_booking_unminified" {
  type        = "zip"
  source_file = "${path.module}/../../dist-unminified/create-vehicle-booking.lambda.js"
  output_path = "${path.module}/create-vehicle-booking-unminified.lambda.zip"
}

resource "aws_lambda_function" "create_vehicle_booking_function_unminified" {
  filename         = data.archive_file.zip_create_vehicle_booking_unminified.output_path
  function_name    = "${var.domain}-${var.domainService}-${var.environment}-CreateVehicleBookingUnminified"
  role             = aws_iam_role.create_vehicle_booking_lambda_role.arn
  handler          = "create-vehicle-booking-lambda.handler"
  runtime          = "nodejs24.x"
  depends_on       = [aws_iam_role_policy_attachment.function_attach_policy_to_role]
  source_code_hash = data.archive_file.zip_create_vehicle_booking_unminified.output_base64sha256
  timeout          = 10
    memory_size = 128
  vpc_config {
    subnet_ids         = [var.vpc_subnet_id]
    security_group_ids = [var.vpc_security_group_id]
  }
  environment {
    variables = {
      DB_ACCESS_ROLE_ARN : var.database_access_role_arn
      DB_NAME : var.domain
      DB_CLUSTER_HOST_SRV : var.database_host
    }
  }
  tags = var.tags


  
}       