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
		ID      uint      `json:"id"`
		Updated time.Time `json:"updatedAt"`
		Status  string    `json:"status"`
		URL     string    `json:"url"`
	}

	// Latency ...
	Latency struct {
		DNS         time.Duration `json:"dns"`
		Connection  time.Duration `json:"connection"`
		TLS         time.Duration `json:"tls"`
		Application time.Duration `json:"application"`
		Total       time.Duration `json:"total"`
	}

	// Check ...
	Check struct {
		ID        uint      `json:"id"`
		WebsiteID uint      `json:"websiteId,omitempty"`
		Checked   time.Time `json:"checkedAt"`
		Result    string    `json:"result"`
		Latency   *Latency  `json:"latency"`
	}
	// API ...
	API struct {
		Endpoint, Key string
		Client        *http.Client
	}
)

// Website status options.
const (
	StatusUnknown     = "unknown"
	StatusUp          = "up"
	StatusMaintenance = "maintenance"
	StatusDown        = "down"
)

// Check result options.
const (
	ResultUp   = "up"
	ResultDown = "down"
)

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
