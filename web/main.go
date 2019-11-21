package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/corenzan/owl/api"

	pgx "github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const (
	// Threshold of a satisfactory request, in ms.
	apdexThreshold = 2000
)

var db *pgxpool.Pool

var errMissingArgument = fmt.Errorf("missing query parameter")

func handleNewWebsite(c echo.Context) error {
	website := &api.Website{}
	if err := c.Bind(website); err != nil {
		panic(err)
	}
	fields := []interface{}{
		&website.ID,
		&website.Status,
		&website.Updated,
	}
	q := `insert into websites (url) values ($1) returning id, status, updated_at;`
	if err := db.QueryRow(context.Background(), q, website.URL).Scan(fields...); err != nil {
		panic(err)
	}
	if err := c.JSON(http.StatusCreated, website); err != nil {
		panic(err)
	}
	return nil
}

func queryWebsite(id string) (*api.Website, error) {
	if id == "" {
		return nil, errMissingArgument
	}
	q := `
		select
			id,
			url,
			status,
			updated_at
		from
			websites
		where
			id = $1
		limit 1;
	`
	website := &api.Website{}
	fields := []interface{}{
		&website.ID,
		&website.URL,
		&website.Status,
		&website.Updated,
	}
	if err := db.QueryRow(context.Background(), q, id).Scan(fields...); err != nil {
		return nil, err
	}
	return website, nil
}

func handleGetWebsite(c echo.Context) error {
	website, err := queryWebsite(c.Param("id"))
	if err != nil {
		switch err {
		case pgx.ErrNoRows:
			return echo.NewHTTPError(http.StatusNotFound)
		case errMissingArgument:
			return echo.NewHTTPError(http.StatusBadRequest)
		default:
			panic(err)
		}
	}
	if err := c.JSON(http.StatusOK, website); err != nil {
		panic(err)
	}
	return nil
}

func queryWebsiteStats(id, beginning, ending string) (*api.Stats, error) {
	if id == "" {
		return nil, errMissingArgument
	}
	if beginning == "" {
		return nil, errMissingArgument
	}
	if ending == "" {
		ending = time.Now().String()
	}
	var found bool
	q := `
		select true from websites where id = $1 limit 1;
	`
	if err := db.QueryRow(context.Background(), q, id).Scan(&found); err != nil {
		return nil, err
	}
	stats := &api.Stats{}
	q = `
		select
			percentage(count(*) filter (where result = 'up'), count(*)) as uptime
		from
			checks
		where
			website_id = $1
			and checked_at between $2 and $3;
	`
	if err := db.QueryRow(context.Background(), q, id, beginning, ending).Scan(&stats.Uptime); err != nil {
		return nil, err
	}
	q = `
		select
			(count(*) filter (where result = 'up' and (latency->>'total')::float < $4)
				+ count(*) filter (where result = 'up' and (latency->>'total')::float >= $4) / 2)
					/ (case count(*) when 0 then 1 else count(*)::float end) as apdex
		from
			checks
		where
			website_id = $1
			and checked_at between $2 and $3;
	`
	if err := db.QueryRow(context.Background(), q, id, beginning, ending, apdexThreshold).Scan(&stats.Apdex); err != nil {
		return nil, err
	}
	q = `
		select
			avg((latency->>'total')::numeric) over (partition by website_id) as average,
			min((latency->>'total')::numeric) over (partition by website_id) as lowest,
			max((latency->>'total')::numeric) over (partition by website_id) as highest
		from
			checks
		where
			website_id = $1
			and checked_at between $2 and $3
			and result = 'up';
	`
	if err := db.QueryRow(context.Background(), q, id, beginning, ending).Scan(&stats.Average, &stats.Lowest, &stats.Highest); err != nil {
		return nil, err
	}
	q = `
		select
			count(*)
		from
			checks where website_id = $1
			and checked_at between $2::timestamptz and $3::timestamptz;
	`
	if err := db.QueryRow(context.Background(), q, id, beginning, ending).Scan(&stats.Count); err != nil {
		return nil, err
	}
	return stats, nil
}

func handleGetWebsiteStats(c echo.Context) error {
	website, err := queryWebsiteStats(c.Param("id"), c.QueryParam("after"), c.QueryParam("before"))
	if err != nil {
		switch err {
		case pgx.ErrNoRows:
			return echo.NewHTTPError(http.StatusNotFound)
		case errMissingArgument:
			return echo.NewHTTPError(http.StatusBadRequest)
		default:
			panic(err)
		}
	}
	if err := c.JSON(http.StatusOK, website); err != nil {
		panic(err)
	}
	return nil
}

func queryWebsites(checkable string) ([]*api.Website, error) {
	q := `
		select
			id,
			url,
			status,
			updated_at
		from
			websites
		order by
			status desc,
			updated_at desc;
	`
	if checkable != "" {
		q = `
			select
				id,
				url,
				status,
				updated_at
			from
				websites
			where
				status != 'maintenance'
			order by
				status desc,
				updated_at desc;
		`
	}
	rows, err := db.Query(context.Background(), q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	websites := []*api.Website{}
	for rows.Next() {
		website := &api.Website{}
		fields := []interface{}{
			&website.ID,
			&website.URL,
			&website.Status,
			&website.Updated,
		}
		if err := rows.Scan(fields...); err != nil {
			return nil, err
		}
		websites = append(websites, website)
	}
	return websites, nil
}

func handleListWebsites(c echo.Context) error {
	websites, err := queryWebsites(c.QueryParam("checkable"))
	if err != nil {
		if err == pgx.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		return err
	}
	if err := c.JSON(http.StatusOK, websites); err != nil {
		return err
	}
	return nil
}

func handleNewCheck(c echo.Context) error {
	website := &api.Website{}
	q := `
		select
			id,
			status
		from
			websites
		where
			id = $1
		limit 1;
	`
	if err := db.QueryRow(context.Background(), q, c.Param("id")).Scan(&website.ID, &website.Status); err != nil {
		if err == pgx.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		panic(err)
	}
	check := &api.Check{
		WebsiteID: website.ID,
	}
	if err := c.Bind(check); err != nil {
		panic(err)
	}
	q = `insert into checks (website_id, result, latency) values ($1, $2, $3) returning id, checked_at;`
	if err := db.QueryRow(context.Background(), q, website.ID, check.Result, check.Latency).Scan(&check.ID, &check.Checked); err != nil {
		panic(err)
	}
	status := api.StatusDown
	if check.Result == api.ResultUp {
		status = api.StatusUp
	}
	if website.Status != status {
		q := `update websites set updated_at = current_timestamp, status = $2 where id = $1;`
		if _, err := db.Exec(context.Background(), q, website.ID, status); err != nil {
			panic(err)
		}
	}
	if err := c.JSON(http.StatusCreated, check); err != nil {
		panic(err)
	}
	return nil
}

func queryWebsiteChecks(id, beginning, ending string) ([]*api.Check, error) {
	if id == "" {
		return nil, errMissingArgument
	}
	if beginning == "" {
		return nil, errMissingArgument
	}
	if ending == "" {
		ending = time.Now().String()
	}
	var found bool
	q := `
		select
			true
		from
			websites
		where
			id = $1
		limit 1;
	`
	if err := db.QueryRow(context.Background(), q, id).Scan(&found); err != nil {
		return nil, err
	}
	q = `
		select
			id,
			checked_at,
			result,
			latency
		from
			checks
		where
			website_id = $1
			and checked_at between $2::timestamptz and $3::timestamptz
		order by
			checked_at asc;
	`
	rows, err := db.Query(context.Background(), q, id, beginning, ending)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	checks := []*api.Check{}
	for rows.Next() {
		check := &api.Check{}
		fields := []interface{}{
			&check.ID,
			&check.Checked,
			&check.Result,
			&check.Latency,
		}
		if err := rows.Scan(fields...); err != nil {
			return nil, err
		}
		checks = append(checks, check)
	}
	return checks, nil
}

func handleListWebsiteChecks(c echo.Context) error {
	checks, err := queryWebsiteChecks(c.Param("id"), c.QueryParam("after"), c.QueryParam("before"))
	if err != nil {
		switch err {
		case pgx.ErrNoRows:
			return echo.NewHTTPError(http.StatusNotFound)
		case errMissingArgument:
			return echo.NewHTTPError(http.StatusBadRequest)
		default:
			panic(err)
		}
	}
	if err := c.JSON(http.StatusOK, checks); err != nil {
		panic(err)
	}
	return nil
}

func queryWebsiteHistory(id, beginning, ending string) ([]*api.Entry, error) {
	if id == "" {
		return nil, errMissingArgument
	}
	if beginning == "" {
		return nil, errMissingArgument
	}
	if ending == "" {
		ending = time.Now().String()
	}
	var found bool
	q := `
		select
			true
		from
			websites
		where
			id = $1
		limit 1;
	`
	if err := db.QueryRow(context.Background(), q, id).Scan(&found); err != nil {
		return nil, err
	}
	q = `
		select
			checked_at as time,
			result as status,
			extract(epoch from lag(checked_at, 1, current_timestamp)
				over (order by checked_at desc) - checked_at)::int as duration
		from
			checks
		where
			website_id = $1
			and checked_at between $2::timestamptz and $3::timestamptz
		order by
			checked_at desc;
	`
	rows, err := db.Query(context.Background(), q, id, beginning, ending)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	history := []*api.Entry{}
	prevEntry := &api.Entry{}
	for rows.Next() {
		entry := &api.Entry{}
		if err := rows.Scan(&entry.Time, &entry.Status, &entry.Duration); err != nil {
			return nil, err
		}
		if prevEntry.Status == entry.Status {
			prevEntry.Time = entry.Time
			prevEntry.Duration += entry.Duration
		} else {
			prevEntry = entry
			history = append(history, entry)
		}
	}
	return history, nil
}

func handleListWebsiteHistory(c echo.Context) error {
	history, err := queryWebsiteHistory(c.Param("id"), c.QueryParam("after"), c.QueryParam("before"))
	if err != nil {
		switch err {
		case pgx.ErrNoRows:
			return echo.NewHTTPError(http.StatusNotFound)
		case errMissingArgument:
			return echo.NewHTTPError(http.StatusBadRequest)
		default:
			panic(err)
		}
	}
	if err := c.JSON(http.StatusOK, history); err != nil {
		panic(err)
	}
	return nil
}

func init() {
	var err error
	db, err = pgxpool.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		panic(err)
	}
}

func main() {
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
	e.GET("/websites/:id/checks", handleListWebsiteChecks)
	e.GET("/websites/:id/history", handleListWebsiteHistory)

	authorize := middleware.KeyAuth(func(key string, c echo.Context) (bool, error) {
		return key == os.Getenv("API_KEY"), nil
	})

	e.POST("/websites", handleNewWebsite, authorize)
	e.POST("/websites/:id/checks", handleNewCheck, authorize)

	done := make(chan struct{})
	shutdown := make(chan os.Signal)
	signal.Notify(shutdown, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		// Wait for the signal.
		<-shutdown
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := e.Shutdown(ctx); err != nil {
			e.Logger.Fatal(err)
		}
		done <- struct{}{}
	}()

	e.Logger.Fatal(e.Start(":" + os.Getenv("PORT")))

	// Wait for shutdown to be done.
	<-done
}
