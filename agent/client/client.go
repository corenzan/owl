package client

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

type (
	// Client ...
	Client struct {
		Endpoint, Key string
		Client        *http.Client
	}
)

// New ...
func New(endpoint, key string) *Client {
	return &Client{
		Endpoint: endpoint,
		Key:      key,
		Client: &http.Client{
			Timeout: time.Second * 3,
		},
	}
}

// NewRequest ...
func (c *Client) NewRequest(method, path string, payload interface{}) (*http.Request, error) {
	body := &bytes.Buffer{}
	if payload != nil {
		err := json.NewEncoder(body).Encode(payload)
		if err != nil {
			return nil, err
		}
	}
	req, err := http.NewRequest(method, c.Endpoint+path, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.Key)
	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	return req, nil
}

// Do ...
func (c *Client) Do(req *http.Request, recipient interface{}) error {
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	if recipient != nil {
		return json.NewDecoder(resp.Body).Decode(recipient)
	}
	return nil
}
