package agent

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"testing"
)

// RoundTripFunc .
type RoundTripFunc func(req *http.Request) *http.Response

// RoundTrip .
func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req), nil
}

//NewTestClient returns *http.Client with Transport replaced to avoid making real calls
func NewTestClient(fn RoundTripFunc) *http.Client {
	return &http.Client{
		Transport: RoundTripFunc(fn),
	}
}

func TestNew(t *testing.T) {
	a := New("https://api", "123")
	if a.endpoint != "https://api" {
		t.Fail()
	}
	if a.key != "123" {
		t.Fail()
	}
}
func TestAPIRequest(t *testing.T) {
	a := New("https://api", "123")

	method := "GET"
	path := "/"

	a.client = NewTestClient(func(req *http.Request) *http.Response {
		if req.Method != method {
			t.Fail()
		}
		if req.URL.String() != a.endpoint+path {
			t.Fail()
		}
		if req.Header.Get("Authorization") != "Bearer "+a.key {
			t.Fail()
		}
		return &http.Response{
			StatusCode: 200,
			Body:       ioutil.NopCloser(bytes.NewBufferString(`OK`)),
			Header:     make(http.Header),
		}
	})

	a.apiRequest(method, path, nil)
}
