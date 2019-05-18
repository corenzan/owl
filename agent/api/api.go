package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

type (
	// Website ...
	Website struct {
		ID        int    `json:"id"`
		URL       string `json:"url"`
		LastCheck *Check `json:"lastCheck"`
	}

	// Breakdown ...
	Breakdown struct {
		DNS        time.Duration `json:"dns"`        // DNSStart-DNSDone
		Connection time.Duration `json:"connection"` // ConnectStart-ConnectDone
		TLS        time.Duration `json:"tls"`        // TLSHandshakeStart-TLSHandshakeDone
		Application       time.Duration `json:"application"`       // WroteRequest-GotFirstResponseByte
	}

	// Check ...
	Check struct {
		Checked    time.Time     `json:"checked"`
		WebsiteID  int           `json:"websiteId"`
		StatusCode int           `json:"statusCode"`
		Duration   time.Duration `json:"duration"`
		Breakdown  *Breakdown    `json:"breakdown"`
	}

	// API ...
	API struct {
		Endpoint, Key string
		Client        *http.Client
	}
)

// Total ...
func (b *Breakdown) Total() time.Duration {
	return b.DNS + b.TLS + b.Connection + b.Application
}

// New ...
func New(endpoint, key string) *API {
	return &API{
		Endpoint: endpoint,
		Key:      key,
		Client: &http.Client{
			Timeout: time.Second * 3,
		},
	}
}

// NewRequest ...
func (a *API) NewRequest(method, path string, payload interface{}) (*http.Request, error) {
	body := &bytes.Buffer{}
	if payload != nil {
		err := json.NewEncoder(body).Encode(payload)
		if err != nil {
			return nil, err
		}
	}
	req, err := http.NewRequest(method, a.Endpoint+path, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+a.Key)
	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	return req, nil
}

// Do ...
func (a *API) Do(req *http.Request, recipient interface{}) error {
	resp, err := a.Client.Do(req)
	if err != nil {
		return err
	}
	if recipient != nil {
		return json.NewDecoder(resp.Body).Decode(recipient)
	}
	return nil
}
