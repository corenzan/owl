FROM node:12.12-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN npm i

COPY . .
EXPOSE 3000

CMD ["yarn", "start"]