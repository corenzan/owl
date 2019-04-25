package agent

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptrace"
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
		Status          int           `json:"status"`
		DNSDelay        time.Duration `json:"dnsDelay"`
		TLSDelay        time.Duration `json:"tlsDelay"`
		ConnectionDelay time.Duration `json:"connectionDelay"`
		NetworkDelay    time.Duration `json:"networkDelay"`
		RequestDelay    time.Duration `json:"requestDelay"`
		ResponseDelay   time.Duration `json:"responseDelay"`
		ResponseSize    int64         `json:"responseSize"`
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
	timeline := &struct {
		DNS, Connection, TLS, Request, Network, Response time.Time
	}{}
	check := &Check{}
	trace := &httptrace.ClientTrace{
		DNSStart: func(_ httptrace.DNSStartInfo) {
			timeline.DNS = time.Now()
		},
		DNSDone: func(_ httptrace.DNSDoneInfo) {
			check.DNSDelay = time.Since(timeline.DNS) / time.Millisecond
		},
		ConnectStart: func(_, _ string) {
			timeline.Connection = time.Now()
		},
		ConnectDone: func(_, _ string, err error) {
			timeline.Request = time.Now()
			check.ConnectionDelay = time.Since(timeline.Connection) / time.Millisecond
		},
		TLSHandshakeStart: func() {
			timeline.TLS = time.Now()
		},
		TLSHandshakeDone: func(_ tls.ConnectionState, err error) {
			if err != nil {
				check.TLSDelay = time.Since(timeline.TLS) / time.Millisecond
			}
		},
		WroteRequest: func(w httptrace.WroteRequestInfo) {
			timeline.Network = time.Now()
			check.RequestDelay = time.Since(timeline.Request)/time.Millisecond - check.TLSDelay
		},
		GotFirstResponseByte: func() {
			timeline.Response = time.Now()
			check.NetworkDelay = time.Since(timeline.Network) / time.Millisecond
		},
	}
	req, err := http.NewRequest("GET", w.URL, nil)
	if err != nil {
		return nil
	}
	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))
	resp, err := a.client.Do(req)
	if err != nil {
		return err
	}
	io.Copy(ioutil.Discard, resp.Body)
	resp.Body.Close()
	check.ResponseDelay = time.Since(timeline.Response) / time.Millisecond
	check.ResponseSize = resp.ContentLength

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
