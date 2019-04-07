module github.com/corenzan/owl/agent/lambda-handler

require (
	github.com/aws/aws-lambda-go v1.10.0
	github.com/corenzan/owl/agent v0.0.0-20190406170617-9fde701805e9
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/stretchr/testify v1.3.0 // indirect
)

replace github.com/corenzan/owl/agent => ../
