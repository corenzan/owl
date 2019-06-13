package agent

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/corenzan/owl/api"
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
	c := New("https://api", "123")
	if c.apiClient.Endpoint != "https://api" {
		t.Fail()
	}
	if c.apiClient.Key != "123" {
		t.Fail()
	}
}

func TestAgentCheck(t *testing.T) {
	history := []*http.Request{}
	testHTTPClient := NewTestClient(func(req *http.Request) *http.Response {
		history = append(history, req)
		return &http.Response{
			StatusCode: 200,
			Body:       ioutil.NopCloser(bytes.NewBufferString(`OK`)),
			Header:     http.Header{},
		}
	})

	c := New("https://api", "123")
	c.checkClient = testHTTPClient
	c.apiClient.Client = testHTTPClient

	check, err := c.Check(&api.Website{
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

	err = c.Report(check)

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
