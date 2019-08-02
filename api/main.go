package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"strconv"

	"github.com/jackc/pgx"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type (
	// Website ...
	Website struct {
		ID      uint      `json:"id"`
		Updated time.Time `json:"updatedAt" db:"updated_at"`
		Status  string    `json:"status"`
		URL     string    `json:"url"`
	}

	// Latency ...
	Latency struct {
		DNS         time.Duration `json:"dns"`
		Connection  time.Duration `json:"connection"`
		TLS         time.Duration `json:"tls"`
		Application time.Duration `json:"application"`
		Total       time.Duration `json:"total"`
	}

	// Check ...
	Check struct {
		ID        uint      `json:"id"`
		WebsiteID uint      `json:"websiteId,omitempty" db:"website_id"`
		Checked   time.Time `json:"checkedAt" db:"checked_at"`
		Result    string    `json:"result"`
		Latency   *Latency  `json:"latency"`
	}

	// Stats ...
	Stats struct {
		Uptime  float64 `json:"uptime"`
		Apdex   float64 `json:"apdex"`
		Average float64 `json:"average"`
		Lowest  float64 `json:"lowest"`
		Highest float64 `json:"highest"`
		Count   uint    `json:"count"`
	}

	// Entry ...
	Entry struct {
		Time     time.Time     `json:"time"`
		Status   string        `json:"status"`
		Duration time.Duration `json:"duration"`
	}
)

const (
	statusUnknown     = "unknown"
	statusMaintenance = "maintenance"
	statusUp          = "up"
	statusDown        = "down"

	resultUp   = "up"
	resultDown = "down"

	// Threshold of a satisfactory request, in ms.
	apdexThreshold = 2000
)

var db *pgx.ConnPool

func handleNewWebsite(c echo.Context) error {
	website := &Website{}
	if err := c.Bind(website); err != nil {
		panic(err)
	}
	q := `insert into websites (url) values ($1) returning id, status, updated_at;`
	if err := db.QueryRow(q, website.URL).Scan(&website.ID, &website.Status, &website.Updated); err != nil {
		panic(err)
	}
	if err := c.JSON(http.StatusCreated, website); err != nil {
		panic(err)
	}
	return nil
}

func handleGetWebsite(c echo.Context) error {
	website := &Website{}
	q := `select id, url, status, updated_at from websites where id = $1 limit 1;`
	if err := db.QueryRow(q, c.Param("id")).Scan(&website.ID, &website.URL, &website.Status, &website.Updated); err != nil {
		if err == pgx.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		panic(err)
	}
	if err := c.JSON(http.StatusOK, website); err != nil {
		panic(err)
	}
	return nil
}

func handleAfterBeforeQueryParams(c echo.Context) (time.Time, time.Time, *echo.HTTPError) {
	var after, before time.Time
	after, err := time.Parse(time.RFC3339, c.QueryParam("after"))
	if err != nil {
		return after, before, echo.NewHTTPError(http.StatusBadRequest, "invalid querystring 'after'")
	}
	before, err = time.Parse(time.RFC3339, c.QueryParam("before"))
	if err != nil {
		return after, before, echo.NewHTTPError(http.StatusBadRequest, "invalid querystring 'before'")
	}
	return after, before, nil
}

func handleGetWebsiteStats(c echo.Context) error {
	var found bool
	q := `select true from websites where id = $1 limit 1`
	if err := db.QueryRow(q, c.Param("id")).Scan(&found); err != nil {
		if err == pgx.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		panic(err)
	}
	after, before, httpErr := handleAfterBeforeQueryParams(c)
	if httpErr != nil {
		return httpErr
	}
	stats := &Stats{}
	q = `select percentage(count(*) filter (where result = 'up'), count(result)) as uptime 
		from checks where website_id = $1 and checked_at between $2::timestamptz and $3::timestamptz;`
	if err := db.QueryRow(q, c.Param("id"), after, before).Scan(&stats.Uptime); err != nil {
		if err != pgx.ErrNoRows {
			panic(err)
		}
	}
	q = `select (count(*) filter (where result = 'up' and (latency->>'total')::float < $1) 
		+ count(*) filter (where result = 'up' and (latency->>'total')::float >= $1) / 2)
		/ (case count(*) when 0 then 1 else count(*)::float end) as apdex from checks where website_id = $2 
		and checked_at between $3::timestamptz and $4::timestamptz;`
	if err := db.QueryRow(q, apdexThreshold, c.Param("id"), after, before).Scan(&stats.Apdex); err != nil {
		if err != pgx.ErrNoRows {
			panic(err)
		}
	}
	q = `select 
		avg((latency->>'total')::numeric) over (partition by website_id) as average, 
		min((latency->>'total')::numeric) over (partition by website_id) as lowest,
		max((latency->>'total')::numeric) over (partition by website_id) as highest
		from checks where result = 'up' and website_id = $1 and checked_at between $2::timestamptz and $3::timestamptz;`
	if err := db.QueryRow(q, c.Param("id"), after, before).Scan(&stats.Average, &stats.Lowest, &stats.Highest); err != nil {
		if err != pgx.ErrNoRows {
			panic(err)
		}
	}
	q = `select count(*) from checks where website_id = $1 
		and checked_at between $2::timestamptz and $3::timestamptz;`
	if err := db.QueryRow(q, c.Param("id"), after, before).Scan(&stats.Count); err != nil {
		if err != pgx.ErrNoRows {
			panic(err)
		}
	}
	if err := c.JSON(http.StatusOK, stats); err != nil {
		panic(err)
	}
	return nil
}

func handleListWebsites(c echo.Context) error {
	q := `select id, url, status, updated_at from websites order by status desc, updated_at desc;`
	checkable := c.QueryParam("checkable")
	if checkable != "" {
		q = `select id, url, status, updated_at from websites where status != 'maintenance' order by status desc, updated_at desc;`
	}
	rows, err := db.Query(q)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	websites := []*Website{}
	for rows.Next() {
		website := &Website{}
		if err := rows.Scan(&website.ID, &website.URL, &website.Status, &website.Updated); err != nil {
			panic(err)
		}
		websites = append(websites, website)
	}
	if err := c.JSON(http.StatusOK, websites); err != nil {
		panic(err)
	}
	return nil
}

func handleNewCheck(c echo.Context) error {
	website := &Website{}
	q := `select id, status from websites where id = $1 limit 1;`
	if err := db.QueryRow(q, c.Param("id")).Scan(&website.ID, &website.Status); err != nil {
		if err == pgx.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		panic(err)
	}
	check := &Check{
		WebsiteID: website.ID,
	}
	if err := c.Bind(check); err != nil {
		panic(err)
	}
	q = `insert into checks (website_id, result, latency) values ($1, $2, $3) returning id, checked_at;`
	if err := db.QueryRow(q, website.ID, check.Result, check.Latency).Scan(&check.ID, &check.Checked); err != nil {
		panic(err)
	}
	status := statusDown
	if check.Result == resultUp {
		status = statusUp
	}
	if website.Status != status {
		q := `update websites set updated_at = current_timestamp, status = $2 where id = $1;`
		if _, err := db.Exec(q, website.ID, status); err != nil {
			panic(err)
		}
	}
	if err := c.JSON(http.StatusCreated, check); err != nil {
		panic(err)
	}
	return nil
}

func handleListChecks(c echo.Context) error {
	var found bool
	q := `select true from websites where id = $1 limit 1`
	if err := db.QueryRow(q, c.Param("id")).Scan(&found); err != nil {
		if err == pgx.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		panic(err)
	}
	after, before, httpErr := handleAfterBeforeQueryParams(c)
	if httpErr != nil {
		return httpErr
	}
	q = `select id, checked_at, result, latency from checks where website_id = $1 and 
		checked_at between $2::timestamptz and $3::timestamptz order by checked_at asc`
	rows, err := db.Query(q, c.Param("id"), after, before)
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	checks := []*Check{}
	for rows.Next() {
		check := &Check{}
		if err := rows.Scan(&check.ID, &check.Checked, &check.Result, &check.Latency); err != nil {
			panic(err)
		}
		checks = append(checks, check)
	}
	if err := c.JSON(http.StatusOK, checks); err != nil {
		panic(err)
	}
	return nil
}

func handleListHistory(c echo.Context) error {
	var found bool
	q := `select true from websites where id = $1 limit 1`
	if err := db.QueryRow(q, c.Param("id")).Scan(&found); err != nil {
		if err == pgx.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		panic(err)
	}
	after, before, httpErr := handleAfterBeforeQueryParams(c)
	if httpErr != nil {
		return httpErr
	}
	q = `select checked_at as time, result as status, extract(epoch from lag(checked_at, 1, current_timestamp) 
	over (order by checked_at desc) - checked_at)::int as duration from checks where website_id = $1 and 
	checked_at between $2::timestamptz and $3::timestamptz order by checked_at desc;`
	rows, err := db.Query(q, c.Param("id"), after, before)
	if err != nil {
		if err != pgx.ErrNoRows {
			panic(err)
		}
	}
	defer rows.Close()
	history := []*Entry{}
	previousEntry := &Entry{}
	for rows.Next() {
		entry := &Entry{}
		if err := rows.Scan(&entry.Time, &entry.Status, &entry.Duration); err != nil {
			panic(err)
		}
		if previousEntry.Status == entry.Status {
			previousEntry.Time = entry.Time
			previousEntry.Duration += entry.Duration
		} else {
			previousEntry = entry
			history = append(history, entry)
		}
	}
	if err := c.JSON(http.StatusOK, history); err != nil {
		panic(err)
	}
	return nil
}

func main() {
	config, err := pgx.ParseURI(os.Getenv("DATABASE_URL"))
	if err != nil {
		panic(err)
	}
	db, err = pgx.NewConnPool(pgx.ConnPoolConfig{
		ConnConfig:     config,
		MaxConnections: strconv.Atoi(os.Getenv("DATABASE_POOL")),
	})
	if err != nil {
		panic(err)
	}

	e := echo.New()

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${id} ${method} ${uri} ${status} ${latency_human} ${remote_ip} ${user_agent}\n",
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())
	e.Use(middleware.CORS())

	e.GET("/websites", handleListWebsites)
	e.GET("/websites/:id", handleGetWebsite)
	e.GET("/websites/:id/stats", handleGetWebsiteStats)
	e.GET("/websites/:id/checks", handleListChecks)
	e.GET("/websites/:id/history", handleListHistory)

	authorize := middleware.KeyAuth(func(key string, c echo.Context) (bool, error) {
		return key == os.Getenv("API_KEY"), nil
	})

	e.POST("/websites", handleNewWebsite, authorize)
	e.POST("/websites/:id/checks", handleNewCheck, authorize)

	shutdown := make(chan os.Signal, 2)
	signal.Notify(shutdown, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		// Wait for the signal.
		<-shutdown
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := e.Shutdown(ctx); err != nil {
			e.Logger.Fatal(err)
		}
		close(shutdown)
	}()

	e.Logger.Fatal(e.Start(":" + os.Getenv("PORT")))

	// Wait for shutdown or a second signal.
	<-shutdown
}
