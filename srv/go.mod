// +heroku goVersion go1.13

module github.com/corenzan/owl/srv

go 1.13

require (
	github.com/corenzan/owl/api v0.0.0-00010101000000-000000000000
	github.com/jackc/pgtype v1.0.3 // indirect
	github.com/jackc/pgx/v4 v4.1.2
	github.com/labstack/echo/v4 v4.1.11
	github.com/mattn/go-colorable v0.1.4 // indirect
	github.com/mattn/go-isatty v0.0.10 // indirect
	github.com/valyala/fasttemplate v1.1.0 // indirect
	golang.org/x/crypto v0.0.0-20191119213627-4f8c1d86b1ba // indirect
	golang.org/x/net v0.0.0-20191119073136-fc4aabc6c914 // indirect
	golang.org/x/sys v0.0.0-20191120155948-bd437916bb0e // indirect
	golang.org/x/xerrors v0.0.0-20191011141410-1b5146add898 // indirect
)

replace github.com/corenzan/owl/api => ../api
