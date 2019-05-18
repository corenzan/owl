package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/corenzan/owl/agent"
	"github.com/corenzan/owl/agent/api"
)

var (
	endpoint, key, url string
)

func init() {
	flag.StringVar(&endpoint, "endpoint", os.Getenv("API_URL"), "endpoint for the api, also read from API_URL")
	flag.StringVar(&key, "key", os.Getenv("API_KEY"), "key for api authorization, also read from API_KEY")
	flag.StringVar(&url, "url", "", "skip the API and just check given URL")
}

func main() {
	flag.Parse()

	a := agent.New(endpoint, key)

	if url != "" {
		check, err := a.Check(&api.Website{
			URL: url,
		})
		if err == nil {
			fmt.Printf("%12s: %s\n", "URL", url)
			fmt.Printf("%12s: %d\n", "StatusCode", check.StatusCode)
			fmt.Printf("%12s: %dms\n", "DNS", check.Breakdown.DNS)
			fmt.Printf("%12s: %dms\n", "TLS", check.Breakdown.TLS)
			fmt.Printf("%12s: %dms\n", "Connection", check.Breakdown.Connection)
			fmt.Printf("%12s: %dms\n", "Application", check.Breakdown.Application)
			fmt.Printf("%12s: %dms\n", "Total", check.Duration)
		} else {
			fmt.Println("agent/cli:", err)
		}
		return
	}

	a.Run()
}
