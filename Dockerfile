FROM golang:1.12-alpine

RUN apk add --no-cache git build-base
RUN go get github.com/cespare/reflex

WORKDIR /go/src/github.com/corenzan/owl

ENV GO111MODULE on

