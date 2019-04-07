[← Back to the main repository](../..).

This is a handler (function) wrapping the Owl agent so it can run on Amazon Lambda.

Use `make` to build, deploy, and update the function on your account. You'll also need to have the [AWS-CLI client](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) already installed and create a `.env` file with some variables in like region and [role ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) for its execution.

See [Building Lambda Functions with Go](https://docs.aws.amazon.com/lambda/latest/dg/go-programming-model.html).

To schedule the agent you can use events. See [Tutorial: Schedule AWS Lambda Functions Using CloudWatch Events](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/RunLambdaSchedule.html).
