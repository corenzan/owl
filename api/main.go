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
		ID        string    `json:"id"`
		Timestamp time.Time `json:"timestamp"`
		URL       string    `json:"url"`
		Status    int       `json:"status"`
	}

	// Check ...
	Check struct {
		ID        string    `json:"id"`
		Timestamp time.Time `json:"timestamp"`
		Status    int       `json:"status"`
		Latency   int       `json:"latency"`
	}
)

func authenticate(key string, c echo.Context) (bool, error) {
	return key == "123", nil
}

func handleNewWebsite(c echo.Context) error {
	website := &Website{
		Timestamp: time.Now(),
	}
	if err := c.Bind(website); err != nil {
		panic(err)
	}
	err := database.QueryRow(`insert into websites (timestamp, url) values ($1, $2) returning id;`, website.Timestamp, website.URL).Scan(&website.ID)
	if err != nil {
		panic(err)
	}
	if err := c.JSON(http.StatusCreated, website); err != nil {
		panic(err)
	}
	return nil
}

func handleListWebsites(c echo.Context) error {
	websites := []*Website{}
	result, err := database.Query(`select id, timestamp, url, status from websites order by status desc;`)
	if err != nil {
		panic(err)
	}
	defer result.Close()
	for result.Next() {
		website := &Website{}
		err := result.Scan(&website.ID, &website.Timestamp, &website.URL, &website.Status)
		if err != nil {
			panic(err)
		}
		websites = append(websites, website)
	}
	return c.JSON(http.StatusOK, websites)
}

func handleNewCheck(c echo.Context) error {
	website := &Website{}
	err := database.QueryRow(`select id, timestamp, url, status from websites where id = $1;`, c.Param("id")).Scan(&website.ID, &website.Timestamp, &website.URL, &website.Status)
	if err != nil {
		panic(err)
	}
	check := &Check{
		Timestamp: time.Now(),
	}
	if err := c.Bind(check); err != nil {
		panic(err)
	}
	err = database.QueryRow(`insert into checks (website_id, timestamp, status, latency) values ($1, $2, $3, $4) returning id;`, website.ID, time.Now(), check.Status, check.Latency).Scan(&check.ID)
	if err != nil {
		panic(err)
	}
	if check.Status != website.Status {
		_, err := database.Exec(`update websites set timestamp = $2, status = $3 where id = $1;`, website.ID, time.Now(), check.Status)
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
	checks := []*Check{}
	result, err := database.Query(`select id, timestamp, status, latency from checks where timestamp > now() - interval '6 hours' order by timestamp asc;`)
	if err != nil {
		panic(err)
	}
	defer result.Close()
	for result.Next() {
		check := &Check{}
		err := result.Scan(&check.ID, &check.Timestamp, &check.Status, &check.Latency)
		if err != nil {
			panic(err)
		}
		checks = append(checks, check)
	}
	return c.JSON(http.StatusOK, checks)
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
	e.Use(middleware.KeyAuth(authenticate))

	e.POST("/websites", handleNewWebsite)
	e.GET("/websites", handleListWebsites)
	e.POST("/websites/:id/checks", handleNewCheck)
	e.GET("/websites/:id/checks", handleListChecks)

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
