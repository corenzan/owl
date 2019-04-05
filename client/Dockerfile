FROM node:11.9-alpine

WORKDIR /usr/local/src
ADD package.json yarn.lock /usr/local/src/
RUN yarn 

ADD . /usr/local/src
EXPOSE 1234

CMD ["yarn", "start"]