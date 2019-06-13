package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/corenzan/owl/agent"
	"github.com/corenzan/owl/api"
)

var (
	endpoint, key, url string
)

func init() {
	flag.StringVar(&endpoint, "endpoint", os.Getenv("API_URL"), "endpoint for the API, also read from API_URL")
	flag.StringVar(&key, "key", os.Getenv("API_KEY"), "key for API authorization, also read from API_KEY")
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
			fmt.Printf("%12s: %dms\n", "DNS", check.Latency.DNS)
			fmt.Printf("%12s: %dms\n", "TLS", check.Latency.TLS)
			fmt.Printf("%12s: %dms\n", "Connection", check.Latency.Connection)
			fmt.Printf("%12s: %dms\n", "Application", check.Latency.Application)
			fmt.Printf("%12s: %dms\n", "Total", check.Latency.Total)
		} else {
			fmt.Println("agent/cli:", err)
		}
		return
	}

	a.Run()
}
