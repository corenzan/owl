package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	_ "github.com/lib/pq"
)

var database *sql.DB

type (
	// Website ...
	Website struct {
		ID      int       `json:"id"`
		Updated time.Time `json:"updated"`
		URL     string    `json:"url"`
		Status  int       `json:"status"`
		Uptime  int       `json:"uptime"`
	}

	// Check ...
	Check struct {
		ID      int       `json:"id"`
		Created time.Time `json:"created"`
		Status  int       `json:"status"`
		Latency int       `json:"latency"`
	}

	// HistoryEntry ...
	HistoryEntry struct {
		Changed  time.Time `json:"changed"`
		Status   int       `json:"status"`
		Duration int       `json:"duration"`
		Latency  int       `json:"latency"`
	}
)

func authenticate(key string, c echo.Context) (bool, error) {
	return key == os.Getenv("API_KEY"), nil
}

func handleNewWebsite(c echo.Context) error {
	website := &Website{
		Updated: time.Now(),
	}
	if err := c.Bind(website); err != nil {
		panic(err)
	}
	err := database.QueryRow(`insert into websites (updated, url) values ($1, $2) returning id;`, website.Updated, website.URL).Scan(&website.ID)
	if err != nil {
		panic(err)
	}
	if err := c.JSON(http.StatusCreated, website); err != nil {
		panic(err)
	}
	return nil
}

func handleListWebsites(c echo.Context) error {
	period := c.QueryParam("period")
	if period == "" {
		period = "1 day"
	}
	result, err := database.Query(`
		select w.id, w.updated, w.url, w.status,
		percentage(sum(case when c.status = 200 then 1 else 0 end), count(c.*)) as uptime
		from websites as w left join checks as c on c.website_id = w.id and c.created > now() - $1::interval
		group by w.id order by case when w.status = 200 then 0 else 1 end asc, w.updated desc;
	`, period)
	if err != nil {
		panic(err)
	}
	defer result.Close()
	websites := []*Website{}
	for result.Next() {
		website := &Website{}
		err := result.Scan(&website.ID, &website.Updated, &website.URL, &website.Status, &website.Uptime)
		if err != nil {
			panic(err)
		}
		websites = append(websites, website)
	}
	return c.JSON(http.StatusOK, websites)
}

func handleNewCheck(c echo.Context) error {
	website := &Website{}
	err := database.QueryRow(`select id, updated, url, status from websites where id = $1;`, c.Param("id")).Scan(&website.ID, &website.Updated, &website.URL, &website.Status)
	if err != nil {
		panic(err)
	}
	check := &Check{
		Created: time.Now(),
	}
	if err := c.Bind(check); err != nil {
		panic(err)
	}
	err = database.QueryRow(`insert into checks (website_id, created, status, latency) values ($1, $2, $3, $4) returning id;`, website.ID, time.Now(), check.Status, check.Latency).Scan(&check.ID)
	if err != nil {
		panic(err)
	}
	if check.Status != website.Status {
		_, err := database.Exec(`update websites set updated = $2, status = $3 where id = $1;`, website.ID, time.Now(), check.Status)
		if err != nil {
			panic(err)
		}
	}
	if err := c.JSON(http.StatusCreated, check); err != nil {
		panic(err)
	}
	return nil
}

func handleListChecks(c echo.Context) error {
	period := c.QueryParam("period")
	if period == "" {
		period = "1 day"
	}
	result, err := database.Query(`select id, created, status, latency from checks where website_id = $1 and created > now() - $2::interval order by created asc;`, c.Param("id"), period)
	if err != nil {
		panic(err)
	}
	defer result.Close()
	checks := []*Check{}
	for result.Next() {
		check := &Check{}
		err := result.Scan(&check.ID, &check.Created, &check.Status, &check.Latency)
		if err != nil {
			panic(err)
		}
		checks = append(checks, check)
	}
	return c.JSON(http.StatusOK, checks)
}

func handleListHistoryEntries(c echo.Context) error {
	period := c.QueryParam("period")
	if period == "" {
		period = "1 month"
	}
	result, err := database.Query(`
		with a as (select created, status, latency, lag(status) over (order by created desc) != status as changed from checks where website_id = $1 and created > now() - $2::interval order by created desc),
		b as (select created, status, latency, sum(case when changed then 1 else 0 end) over (order by created desc) as change_id from a order by created desc),
		c as (select min(created) as changed, min(status) as status, round(avg(latency)) as latency from b group by change_id order by changed desc)
		select changed, status, round(extract(epoch from lag(changed, 1, current_timestamp) over (order by changed desc) - changed)) as duration, latency from c order by changed desc;
	`, c.Param("id"), period)
	if err != nil {
		panic(err)
	}
	defer result.Close()
	history := []*HistoryEntry{}
	for result.Next() {
		entry := &HistoryEntry{}
		err := result.Scan(&entry.Changed, &entry.Status, &entry.Duration, &entry.Latency)
		if err != nil {
			panic(err)
		}
		history = append(history, entry)
	}
	return c.JSON(http.StatusOK, history)
}

func main() {
	var err error
	database, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${id} ${method} ${uri} ${status} ${latency_human} ${remote_ip} ${user_agent}\n",
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())
	e.Use(middleware.CORS())

	e.GET("/websites", handleListWebsites)
	e.GET("/websites/:id/checks", handleListChecks)
	e.GET("/websites/:id/history", handleListHistoryEntries)

	reqAuth := middleware.KeyAuth(authenticate)

	e.POST("/websites", handleNewWebsite, reqAuth)
	e.POST("/websites/:id/checks", handleNewCheck, reqAuth)

	shutdown := make(chan os.Signal)
	signal.Notify(shutdown, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-shutdown
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := e.Shutdown(ctx); err != nil {
			e.Logger.Fatal(err)
		}
	}()

	e.Logger.Fatal(e.Start(":" + os.Getenv("PORT")))
}
