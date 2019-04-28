package main

import (
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/corenzan/owl/agent"
	"github.com/corenzan/owl/agent/api"
)

var (
	endpoint, key string
)

func init() {
	flag.StringVar(&endpoint, "endpoint", os.Getenv("API_URL"), "endpoint for the api, also read from API_URL")
	flag.StringVar(&key, "key", os.Getenv("API_KEY"), "key for api authorization, also read from API_KEY")
}

func main() {
	flag.Parse()

	a := agent.New(endpoint, key)

	url := flag.Arg(0)
	if url == "" {
		a.Run()
	} else {
		check, err := a.Check(&api.Website{
			URL: url,
		})
		if err == nil {
			fmt.Printf("%10s: %s\n", "URL", url)
			fmt.Printf("%10s: %d\n", "StatusCode", check.StatusCode)
			fmt.Printf("%10s: %4dms\n", "DNS", check.Breakdown.DNS/time.Millisecond)
			fmt.Printf("%10s: %4dms\n", "TLS", check.Breakdown.TLS/time.Millisecond)
			fmt.Printf("%10s: %4dms\n", "Connection", check.Breakdown.Connection/time.Millisecond)
			fmt.Printf("%10s: %4dms\n", "Wait", check.Breakdown.Wait/time.Millisecond)
			fmt.Printf("%10s: %4dms\n", "Total", check.Duration/time.Millisecond)
		} else {
			fmt.Println("agent/cli: check failed", err)
		}
	}
}
