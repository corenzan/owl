package agent

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/corenzan/owl/agent/api"
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
	if a.api.Endpoint != "https://api" {
		t.Fail()
	}
	if a.api.Key != "123" {
		t.Fail()
	}
}

func TestAgentCheck(t *testing.T) {
	history := []*http.Request{}
	c := NewTestClient(func(req *http.Request) *http.Response {
		history = append(history, req)
		return &http.Response{
			StatusCode: 200,
			Body:       ioutil.NopCloser(bytes.NewBufferString(`OK`)),
			Header:     http.Header{},
		}
	})

	a := New("https://api", "123")
	a.client = c
	a.api.Client = c

	check, err := a.Check(&api.Website{
		ID:  1,
		URL: "https://website",
	})

	if err != nil {
		t.Fail()
	}
	if history[0].Method != "GET" {
		t.Fail()
	}
	if history[0].URL.String() != "https://website" {
		t.Fail()
	}

	err = a.Report(check)

	if err != nil {
		t.Fail()
	}
	if history[1].Method != "POST" {
		t.Fail()
	}
	if history[1].URL.String() != "https://api/websites/1/checks" {
		t.Fail()
	}
}
