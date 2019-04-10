FROM golang:1.12-alpine

RUN apk add --no-cache build-base git 
RUN go get github.com/cespare/reflex

WORKDIR /usr/local/src
ADD . /usr/local/src

ENV GO111MODULE on
EXPOSE 5000

