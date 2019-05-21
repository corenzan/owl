module github.com/corenzan/owl/agent/lambda

replace github.com/corenzan/owl/agent => ../

replace github.com/corenzan/owl/agent/api => ../api

require (
	github.com/aws/aws-lambda-go v1.10.0
	github.com/corenzan/owl/agent v0.0.0-00010101000000-000000000000
	github.com/stretchr/testify v1.3.0 // indirect
)
