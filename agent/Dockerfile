FROM golang:1.12.1-alpine

RUN apk add --no-cache build-base git 

WORKDIR /usr/local/src
ADD . /usr/local/src
RUN ln -s /usr/local/src/crontab /etc/crontabs/owl

ENV GO111MODULE on

CMD ["crond", "-f"]