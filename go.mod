// +heroku goVersion go1.13
// +heroku install github.com/corenzan/owl/web

module github.com/corenzan/owl

go 1.13

replace github.com/corenzan/owl/api => ./api

require (
	github.com/aws/aws-lambda-go v1.13.3
	github.com/jackc/pgx/v4 v4.1.2
	github.com/labstack/echo/v4 v4.9.0
)
