package main

import (
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/corenzan/owl/agent"
)

var a *agent.Agent

func init() {
	endpoint := os.Getenv("API_URL")
	key := os.Getenv("API_KEY")

	a = agent.New(endpoint, key)
}

func main() {
	lambda.Start(a.Run)
}
