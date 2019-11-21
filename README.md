# Owl

> Owl is an open-source self-hosted solution for website monitoring and status report.

![Owl](screenshot.png)

## About

Owl comprises 3 Go modules and 1 React application:

1. An web server that handles all the data in and out of the database.
2. An agent that can check HTTP endpoints and post the results to the server.
3. An API library for common types.
4. A web client for the dashboard.

## Development

You'll need docker-compose 1.23+. Simply run:

```sh
$ docker-compose up
```

### Server

Located at [./srv](srv).

The Server is a web service written in Go using [Echo](https://echo.labstack.com/) and backed by PostgreSQL 11. The container will watch for source file changes and automatically rebuild.

### Agent

Located at [./agent](agent).

The Agent is a Go package designed to be invoked from a standalone Go program. The container will watch for source file changes and automatically run its test suite.

It also includes three sub-packages:

- [./agent/client](agent/client) a decorated HTTP client ready to talk with the Owl server.
- [./agent/lambda](agent/lambda) wraps the client to run on Amazon Lambda.
- [./agent/cli](agent/cli) wraps the client to be ran from a CLI.

### Client

The client is a React application controlled by [create-react-app](https://github.com/facebook/create-react-app).

## Deploy

⚠️ Although both the server and the client share the same repository **they're deployed separately**. For heroku like environments you can use [git-subtree](https://github.com/apenwarr/git-subtree/blob/master/git-subtree.txt). e.g.

```shell
$ git subtree push --prefix srv heroku master
```

## License

MIT License © 2019 Corenzan
