// +heroku goVersion go1.12
// +heroku install .

module github.com/corenzan/owl/srv

require (
	github.com/cockroachdb/apd v1.1.0 // indirect
	github.com/corenzan/owl/api v0.0.0
	github.com/jackc/fake v0.0.0-20150926172116-812a484cc733 // indirect
	github.com/jackc/pgx v3.4.0+incompatible
	github.com/kr/pretty v0.1.0 // indirect
	github.com/labstack/echo/v4 v4.1.5
	github.com/lib/pq v1.1.1 // indirect
	github.com/pkg/errors v0.8.1 // indirect
	github.com/satori/go.uuid v1.2.0 // indirect
	github.com/shopspring/decimal v0.0.0-20180709203117-cd690d0c9e24 // indirect
	gopkg.in/check.v1 v1.0.0-20180628173108-788fd7840127 // indirect
)

replace github.com/corenzan/owl/api => ../api
