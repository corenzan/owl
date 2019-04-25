package agent

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"testing"
)

type RoundTripFunc func(req *http.Request) *http.Response

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req), nil
}

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
func TestAgentAPIRequest(t *testing.T) {
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

func TestAgentCheck(t *testing.T) {
	a := New("https://api", "123")

	history := []*http.Request{}

	a.client = NewTestClient(func(req *http.Request) *http.Response {
		history = append(history, req)
		return &http.Response{
			StatusCode: 200,
			Body:       ioutil.NopCloser(bytes.NewBufferString(`OK`)),
			Header:     http.Header{},
		}
	})

	a.Check(&Website{
		ID:  1,
		URL: "https://website",
	})

	if history[0].Method != "GET" {
		t.Fail()
	}
	if history[0].URL.String() != "https://website" {
		t.Fail()
	}

	if history[1].Method != "POST" {
		t.Fail()
	}
	if history[1].URL.String() != "https://api/websites/1/checks" {
		t.Fail()
	}
}
