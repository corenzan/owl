FROM node:11.9-alpine

WORKDIR /src
ADD package.json yarn.lock /src/
RUN yarn 

ADD . /src
EXPOSE 3000

CMD ["yarn", "start"]