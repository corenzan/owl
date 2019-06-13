FROM golang:1.12-alpine

RUN apk add --no-cache git build-base
RUN go get github.com/cespare/reflex

ENV GO111MODULE on

CMD ["reflex", "--", "go", "test", "-cover", "."]
