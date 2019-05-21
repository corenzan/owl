package agent

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"net/http/httptrace"
	"sync"
	"time"

	"github.com/corenzan/owl/agent/api"
)

type (
	// Agent ...
	Agent struct {
		api    *api.API
		client *http.Client
	}

	// Timeline ...
	Timeline struct {
		Connection, DNS, Dial, TLS, Request, Application, Response time.Time
	}
)

// New ...
func New(endpoint, key string) *Agent {
	return &Agent{
		api: api.New(endpoint, key),
		client: &http.Client{
			Timeout: time.Second * 5,
		},
	}
}

// Check ...
func (a *Agent) Check(website *api.Website) (*api.Check, error) {
	check := &api.Check{
		WebsiteID: website.ID,
		Breakdown: &api.Breakdown{},
	}
	timeline := &Timeline{}
	trace := &httptrace.ClientTrace{
		DNSStart: func(_ httptrace.DNSStartInfo) {
			timeline.DNS = time.Now()
		},
		DNSDone: func(_ httptrace.DNSDoneInfo) {
			check.Breakdown.DNS = time.Since(timeline.DNS) / time.Millisecond
		},
		ConnectStart: func(_, _ string) {
			timeline.Connection = time.Now()
		},
		ConnectDone: func(_, _ string, _ error) {
			check.Breakdown.Connection = time.Since(timeline.Connection) / time.Millisecond
		},
		TLSHandshakeStart: func() {
			timeline.TLS = time.Now()
		},
		TLSHandshakeDone: func(_ tls.ConnectionState, _ error) {
			check.Breakdown.TLS = time.Since(timeline.TLS) / time.Millisecond
		},
		WroteRequest: func(_ httptrace.WroteRequestInfo) {
			timeline.Application = time.Now()
		},
		GotFirstResponseByte: func() {
			check.Breakdown.Application = time.Since(timeline.Application) / time.Millisecond
		},
	}
	req, err := http.NewRequest("GET", website.URL, nil)
	if err != nil {
		return nil, err
	}
	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))
	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	check.Duration = check.Breakdown.Total()
	check.StatusCode = resp.StatusCode
	return check, nil
}

// Report ...
func (a *Agent) Report(check *api.Check) error {
	req, err := a.api.NewRequest("POST", fmt.Sprintf("/websites/%d/checks", check.WebsiteID), check)
	if err != nil {
		return err
	}
	return a.api.Do(req, nil)
}

// Run ...
func (a *Agent) Run() {
	req, err := a.api.NewRequest("GET", "/websites?checkable=1", nil)
	if err != nil {
		log.Fatal("agent: failed to fetch websites", err)
	}
	websites := []*api.Website{}
	err = a.api.Do(req, &websites)
	if err != nil {
		log.Fatal("agent: failed to fetch websites", err)
	}
	semaphore := make(chan struct{}, 5)
	wg := &sync.WaitGroup{}
	for _, website := range websites {
		wg.Add(1)

		go (func(w *api.Website) {
			defer wg.Done()
			defer (func() {
				<-semaphore
			})()
			semaphore <- struct{}{}
			log.Printf("agent: checking %s", w.URL)
			check, err := a.Check(w)
			if err != nil {
				log.Fatal("agent: check failed", err)
			}
			err = a.Report(check)
			if err != nil {
				log.Fatal("agent: report failed", err)
			}
		})(website)
	}
	wg.Wait()
}
