FROM golang:1.12.1-alpine

RUN apk add --no-cache build-base git 

WORKDIR /usr/local/src
ADD . /usr/local/src

ENV GO111MODULE on

CMD ["/usr/local/src/entrypoint.sh"]