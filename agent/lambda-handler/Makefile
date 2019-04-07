PREFIX=$(abspath .)
GOOS=linux
GOARCH=amd64
RUNTIME=go1.x
MEMORY=128
NAME=owl-agent
HANDLER=dist/owl-agent-lambda-handler
REGION=
TIMEOUT=300
ROLE=
ZIPFILE=$(HANDLER).zip

include .env

default: clean
	mkdir -p dist
	go build -o $(HANDLER) .
	zip $(ZIPFILE) $(HANDLER)
clean:
	rm -rf dist
update: default
	aws lambda update-function-code \
		--function-name $(NAME) \
		--zip-file fileb://$(PREFIX)/$(ZIPFILE)
create: default
	aws lambda create-function \
		--region $(REGION) \
		--function-name $(NAME) \
		--memory $(MEMORY) \
		--role $(ROLE) \
		--timeout $(TIMEOUT)
		--runtime $(RUNTIME) \
		--zip-file fileb://$(PREFIX)/$(ZIPFILE) \
		--handler $(HANDLER) \
		--environment Variables={API_KEY=$(API_KEY),API_URL=$(API_URL)}
invoke:
	aws lambda invoke \
		--function-name $(NAME) \
		invoke.log

PHONY: default clean update create invoke