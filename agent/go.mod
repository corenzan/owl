module github.com/corenzan/owl/agent

go 1.13

require (
	github.com/aws/aws-lambda-go v1.13.3
	github.com/corenzan/owl/api v0.0.0-20190802113406-48f1a08fcabd
)

replace github.com/corenzan/owl/api => ../api
