package agent

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
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

	// Agent ...
	Agent struct {
		endpoint, key string
		client        *http.Client
	}
)

// New ...
func New(endpoint, key string) *Agent {
	return &Agent{
		endpoint: endpoint,
		key:      key,
		client: &http.Client{
			Timeout: time.Second * 5,
		},
	}
}

func (a *Agent) apiRequest(method, path string, body io.Reader) (*http.Response, error) {
	req, err := http.NewRequest(method, a.endpoint+path, body)
	req.Header.Add("Authorization", "Bearer "+a.key)
	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// Check ...
func (a *Agent) Check(w *Website) error {
	check := &Check{
		Status: 999,
	}
	checkpoint := time.Now()
	resp, err := a.client.Head(w.URL)
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
	_, err = a.apiRequest("POST", fmt.Sprintf("/websites/%d/checks", w.ID), payload)
	if err != nil {
		return err
	}
	return nil
}

// Run ...
func (a *Agent) Run() {
	resp, err := a.apiRequest("GET", "/websites", nil)
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
		err := a.Check(website)
		if err != nil {
			log.Fatal("check failed: ", err)
		}
	}
}
