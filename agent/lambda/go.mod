module github.com/corenzan/owl/agent/lambda

require (
	github.com/aws/aws-lambda-go v1.10.0
	github.com/corenzan/owl/agent v0.0.0-20190419141824-fbb2b09fef2b
	github.com/stretchr/objx v0.2.0 // indirect
)

replace github.com/corenzan/owl/agent => ../

replace github.com/corenzan/owl/agent/api => ../api
