package api

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"testing"
	"time"
)

func TestBreakdownTotla(t *testing.T) {
	b := &Breakdown{
		DNS:         1,
		Connection:  1,
		TLS:         1,
		Application: 1,
	}
	if b.Total() != time.Duration(4) {
		t.Fail()
	}
}

func TestNew(t *testing.T) {
	a := New("http://server", "123")
	if a.Endpoint != "http://server" {
		t.Fail()
	}
	if a.Key != "123" {
		t.Fail()
	}
	if a.Client == nil {
		t.Fail()
	}
}

func TestAPINewRequest(t *testing.T) {
	a := New("http://server", "123")
	req, err := a.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fail()
	}
	if req.Method != "GET" {
		t.Fail()
	}
	if req.URL.String() != "http://server/" {
		t.Fail()
	}
	if req.Header.Get("Authorization") != "Bearer 123" {
		t.Fail()
	}
	if req.Header.Get("Content-Type") != "application/json; charset=utf-8" {
		t.Fail()
	}
	payload := []int{1, 2, 3}
	req, err = a.NewRequest("GET", "/", payload)
	if err != nil {
		t.Fail()
	}
	if body, err := ioutil.ReadAll(req.Body); err != nil || string(body) != "[1,2,3]\n" {
		t.Fail()
	}
}

type RoundTripFunc func(req *http.Request) *http.Response

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req), nil
}

func NewTestClient(f RoundTripFunc) *http.Client {
	return &http.Client{
		Transport: RoundTripFunc(f),
	}
}
func TestAPIDo(t *testing.T) {
	a := New("http://server", "123")
	req, _ := a.NewRequest("GET", "/", nil)

	a.Client = NewTestClient(func(req *http.Request) *http.Response {
		return &http.Response{
			StatusCode: 200,
			Body:       ioutil.NopCloser(bytes.NewBufferString(`"OK"`)),
			Header:     make(http.Header),
		}
	})

	var result string
	err := a.Do(req, &result)
	if err != nil {
		t.Fail()
	}
	if result != "OK" {
		t.Fail()
	}
}
