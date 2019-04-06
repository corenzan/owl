![Owl](screenshot.png)

# Owl

> Owl is an open source self-hosted website monitor and uptime report dashboard.

## Work in progress

🚨️ This is a work in progress!

## About

Owl comprises three packages:

1. A web API that handles all the data in and out of the database.
2. An agent that periodically checks your websites and report back to the API.
3. A client that consumes the API to display a report with which sites are up, which are down, for how long, among other details.

## Development

You'll need docker-compose 1.23+.

```sh
$ docker-compose up
```

### Agent

The agent is a program written in Go designed to run separately from the client and API.

When you start the container it'll be ran periodically. You can change how often by providing a file "sleep.txt" with the amount in seconds (defaults to 60, i.e. 1 minute).

### API

The API is a REST-like API written in Go backed by an instance of PostgreSQL. We use [fresh](https://github.com/gravityblast/fresh) to rebuild automatically on change.

### Client

The client is a React application controlled by [create-react-app](https://github.com/facebook/create-react-app).

## Deploy

⚠️ Albeit the agent, the API, and the client share the same repository **they're deployed separately**. For heroku like environments you can use [git-subtree](https://github.com/apenwarr/git-subtree/blob/master/git-subtree.txt). e.g.

```shell
$ git subtree push --prefix api heroku master
```

## License

The MIT License © 2019 Corenzan
