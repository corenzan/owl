module github.com/corenzan/owl/agent

go 1.12

require (
	github.com/aws/aws-lambda-go v1.11.1
	github.com/corenzan/owl/api v0.0.0-00010101000000-000000000000
)

replace github.com/corenzan/owl/api => ../api
