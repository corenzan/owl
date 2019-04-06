package agent

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

func check(c *http.Client, w *Website) error {
	check := &Check{
		Status: 999,
	}
	checkpoint := time.Now()
	resp, err := http.Head(w.URL)
	// TODO: we still need to surface this error but differently
	// than the others beucase although it indicates a failure
	// to check the site, it could very well be the agent's fault.
	if err == nil {
		check.Status = resp.StatusCode
	}
	check.Latency = time.Since(checkpoint) / time.Millisecond
	payload := &bytes.Buffer{}
	err = json.NewEncoder(payload).Encode(check)
	if err != nil {
		return err
	}
	_, err = apiRequest(c, "POST", fmt.Sprintf("/websites/%d/checks", w.ID), payload)
	if err != nil {
		return err
	}
	return nil
}

// Run ...
func Run() {
	c := &http.Client{
		Timeout: time.Second * 5,
	}
	resp, err := apiRequest(c, "GET", "/websites", nil)
	if err != nil {
		log.Fatal("api request failed: ", err)
	}
	websites := []*Website{}
	err = json.NewDecoder(resp.Body).Decode(&websites)
	if err != nil {
		log.Fatal("api decode failed: ", err)
	}
	for _, website := range websites {
		log.Printf("checking %s", website.URL)
		err := check(c, website)
		if err != nil {
			log.Fatal("check failed: ", err)
		}
	}
}
