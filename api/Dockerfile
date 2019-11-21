FROM golang:1.13-alpine

RUN apk add --no-cache git build-base
RUN go get github.com/cespare/reflex

ENV GO111MODULE auto

CMD ["reflex", "--", "go", "test", "-cover", "."]
