package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type (
	// Website ...
	Website struct {
		ID  int    `json:"id"`
		URL string `json:"url"`
	}

	// Check ...
	Check struct {
		Status  int           `json:"status"`
		Latency time.Duration `json:"latency"`
	}
)

var (
	endpoint = os.Getenv("API_URL")
	key      = os.Getenv("API_KEY")
)

func apiRequest(c *http.Client, method, path string, body io.Reader) (*http.Response, error) {
	req, err := http.NewRequest(method, endpoint+path, body)
	req.Header.Add("Authorization", "Bearer "+key)
	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func main() {
	c := &http.Client{
		Timeout: time.Second * 5,
	}
	resp, err := apiRequest(c, "GET", "/websites", nil)
	if err != nil {
		log.Print("api: websites request failed")
		log.Fatal(err)
	}
	websites := []*Website{}
	err = json.NewDecoder(resp.Body).Decode(&websites)
	if err != nil {
		log.Print("api: decode failed")
		log.Fatal(err)
	}
	for _, website := range websites {
		log.Printf("website: checking %s", website.URL)
		check := &Check{
			Status: 999,
		}
		checkpoint := time.Now()
		resp, err := http.Head(website.URL)
		if err == nil {
			check.Status = resp.StatusCode
		} else {
			log.Print("website: request failed")
			log.Print(err)
		}
		check.Latency = time.Since(checkpoint) / time.Millisecond
		payload := &bytes.Buffer{}
		err = json.NewEncoder(payload).Encode(check)
		if err != nil {
			log.Print("api: encode failed")
			log.Fatal(err)
		}
		_, err = apiRequest(c, "POST", fmt.Sprintf("/websites/%d/checks", website.ID), payload)
		if err != nil {
			log.Print("api: checks request failed")
			log.Fatal(err)
		}
	}
}
