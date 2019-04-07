PREFIX=$(abspath .)
GOOS=linux
GOARCH=amd64
RUNTIME=go1.x
MEMORY=128
NAME=owl-agent
HANDLER=owl-agent-lambda-handler
REGION=
ROLE=
ZIPFILE=dist/$(HANDLER).zip

include .env

default: clean
	mkdir -p dist
	go build -o dist/$(HANDLER) .
	zip $(ZIPFILE) dist/$(HANDLER)
clean:
	rm -rf dist
update: default
	aws lambda create-function \
		--function-name $(NAME) \
		--zip-file fileb://$(PREFIX)/$(ZIPFILE)
create: default
	aws lambda create-function \
		--region $(REGION) \
		--function-name $(NAME) \
		--memory $(MEMORY) \
		--role $(ROLE) \
		--runtime $(RUNTIME) \
		--zip-file fileb://$(PREFIX)/$(ZIPFILE) \
		--handler $(HANDLER)

PHONY: default clean update create