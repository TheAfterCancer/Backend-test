provider "aws" {
    region = "eu-north-1"
}

resource "aws_dynamodb_table" "orders" {
    name = "Orders"
    attribute {
        name = "id"
        type = "S"
    }
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "id"
    
}

resource "aws_iam_role" "lambda_exec_role" {
    name = "orders_api_lambda_role"
    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "lambda.amazonaws.com"
                }
            }
        ]
    })
}

resource "aws_iam_role_policy" "lambda_policy" {
    name = "orders_api_policy"
    role = aws_iam_role.lambda_exec_role.id
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "dynamodb:Scan",
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:UpdateItem"
                ]
                Resource = aws_dynamodb_table.orders.arn
            },
            {
                Effect = "Allow"
                Action = [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ]
                Resource = "arn:aws:logs:*:*:*"
            }
        ]
    })
}


resource "aws_lambda_layer_version" "node_modules_layer" {
    filename = "node_layer.zip"
    layer_name = "node_modules_layer"
    compatible_runtimes = ["nodejs20.x"]
}

resource "aws_lambda_function" "orders_api" {
    filename = "packaged_code.zip"
    function_name = "orders_api"
    role = aws_iam_role.lambda_exec_role.arn
    handler = "lambda.handler"
    runtime = "nodejs18.x"
    source_code_hash = filebase64sha256("packaged_code.zip")
    timeout = 10
    layers = [aws_lambda_layer_version.node_modules_layer.arn]

    environment {
        variables = {
            DYNAMODB_ENDPOINT = "https://dynamodb.eu-north-1.amazonaws.com"
            DYNAMODB_TABLE = "Orders"
        }
    }
}

resource "aws_api_gateway_rest_api" "orders_api" {
    name = "orders-api"
    description = "Orders API"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.orders_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:eu-north-1:058264354170:${aws_api_gateway_rest_api.orders_api.id}/*/*/*"
}

resource "aws_api_gateway_resource" "orders_resource" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    parent_id = aws_api_gateway_rest_api.orders_api.root_resource_id
    path_part = "orders"
}

resource "aws_api_gateway_resource" "order_id_resource" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    parent_id   = aws_api_gateway_resource.orders_resource.id
    path_part   = "{id}"
}

resource "aws_api_gateway_method" "get_all_orders" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = "GET"
    authorization = "NONE"
}

resource "aws_api_gateway_method" "get_order_by_id" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.order_id_resource.id
    http_method = "GET"
    authorization = "NONE"
}

resource "aws_api_gateway_method" "create_order" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = "POST"
    authorization = "NONE"
}

resource "aws_api_gateway_method" "delete_order" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = "DELETE"
    authorization = "NONE"
}

resource "aws_api_gateway_method" "update_order" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = "PUT"
    authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_all_orders" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = aws_api_gateway_method.get_all_orders.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = "arn:aws:apigateway:eu-north-1:lambda:path/2015-03-31/functions/${aws_lambda_function.orders_api.arn}/invocations"
}

resource "aws_api_gateway_integration" "get_order_by_id" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.order_id_resource.id
    http_method = aws_api_gateway_method.get_order_by_id.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = "arn:aws:apigateway:eu-north-1:lambda:path/2015-03-31/functions/${aws_lambda_function.orders_api.arn}/invocations"
}

resource "aws_api_gateway_integration" "create_order" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = aws_api_gateway_method.create_order.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = "arn:aws:apigateway:eu-north-1:lambda:path/2015-03-31/functions/${aws_lambda_function.orders_api.arn}/invocations"
}

resource "aws_api_gateway_integration" "delete_order" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = aws_api_gateway_method.delete_order.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = "arn:aws:apigateway:eu-north-1:lambda:path/2015-03-31/functions/${aws_lambda_function.orders_api.arn}/invocations"
}

resource "aws_api_gateway_integration" "update_order" {
    rest_api_id = aws_api_gateway_rest_api.orders_api.id
    resource_id = aws_api_gateway_resource.orders_resource.id
    http_method = aws_api_gateway_method.update_order.http_method
    integration_http_method = "POST"
    type = "AWS_PROXY"
    uri = "arn:aws:apigateway:eu-north-1:lambda:path/2015-03-31/functions/${aws_lambda_function.orders_api.arn}/invocations"
}

resource "aws_api_gateway_deployment" "orders_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.get_all_orders,
    aws_api_gateway_integration.get_order_by_id,
    aws_api_gateway_integration.create_order,
    aws_api_gateway_integration.delete_order,
    aws_api_gateway_integration.update_order
  ]
  rest_api_id = aws_api_gateway_rest_api.orders_api.id
}

resource "aws_api_gateway_stage" "prod" {
  rest_api_id    = aws_api_gateway_rest_api.orders_api.id
  deployment_id  = aws_api_gateway_deployment.orders_api_deployment.id
  stage_name     = "prod"
  description    = "Production stage"
}

