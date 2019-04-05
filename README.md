# Owl

> Website uptime report and serverless checker.

## About

Owl comprises three packages:

1. An API that handles all the data in and out of the database.
2. An agent that's designed to run on AWS Lambda where it periodically gets a list of websites to check, makes a request to each one and record the response back in the API.
3. A client that consumes the API to display which sites are up, which are down, for how long, and other details such as average response time.

## Development

You'll need docker-compose 1.23+.

```sh
$ docker-compose up
```

...

## License

The MIT License © 2017 Corenzan
