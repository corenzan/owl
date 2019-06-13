package agent

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"net/http/httptrace"
	"sync"
	"time"

	"github.com/corenzan/owl/agent/client"
	"github.com/corenzan/owl/api"
)

type (
	// Agent ...
	Agent struct {
		apiClient   *client.Client
		checkClient *http.Client
	}

	// Timeline ...
	Timeline struct {
		Connection, DNS, Dial, TLS, Request, Wait, Response time.Time
	}
)

// New ...
func New(endpoint, key string) *Agent {
	return &Agent{
		apiClient: client.New(endpoint, key),
		checkClient: &http.Client{
			Timeout: time.Second * 10,
			CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
}

// Check ...
func (a *Agent) Check(website *api.Website) (*api.Check, error) {
	check := &api.Check{
		WebsiteID: website.ID,
		Result:    api.ResultDown,
		Latency:   &api.Latency{},
	}
	timeline := &Timeline{}
	trace := &httptrace.ClientTrace{
		DNSStart: func(_ httptrace.DNSStartInfo) {
			timeline.DNS = time.Now()
		},
		DNSDone: func(_ httptrace.DNSDoneInfo) {
			check.Latency.DNS = time.Since(timeline.DNS) / time.Millisecond
		},
		ConnectStart: func(_, _ string) {
			timeline.Connection = time.Now()
		},
		ConnectDone: func(_, _ string, _ error) {
			check.Latency.Connection = time.Since(timeline.Connection) / time.Millisecond
		},
		TLSHandshakeStart: func() {
			timeline.TLS = time.Now()
		},
		TLSHandshakeDone: func(_ tls.ConnectionState, _ error) {
			check.Latency.TLS = time.Since(timeline.TLS) / time.Millisecond
		},
		WroteRequest: func(_ httptrace.WroteRequestInfo) {
			timeline.Wait = time.Now()
		},
		GotFirstResponseByte: func() {
			check.Latency.Application = time.Since(timeline.Wait) / time.Millisecond
		},
	}
	req, err := http.NewRequest("GET", website.URL, nil)
	if err != nil {
		return nil, err
	}
	resp, err := a.checkClient.Do(req.WithContext(httptrace.WithClientTrace(req.Context(), trace)))
	if err == nil {
		if resp.StatusCode < 500 {
			check.Result = api.ResultUp
		}
	}
	check.Latency.Total = check.Latency.DNS + check.Latency.TLS +
		check.Latency.Connection + check.Latency.Application
	return check, err
}

// Report ...
func (a *Agent) Report(check *api.Check) error {
	req, err := a.apiClient.NewRequest("POST", fmt.Sprintf("/websites/%d/checks", check.WebsiteID), check)
	if err != nil {
		return err
	}
	return a.apiClient.Do(req, nil)
}

// Run ...
func (a *Agent) Run() {
	req, err := a.apiClient.NewRequest("GET", "/websites?checkable=1", nil)
	if err != nil {
		log.Printf("agent: failed to fetch websites: %s", err)
	}
	websites := []*api.Website{}
	err = a.apiClient.Do(req, &websites)
	if err != nil {
		log.Printf("agent: failed to fetch websites: %s", err)
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
				log.Printf("agent: check failed: %s", err)
			}
			if check != nil {
				if err := a.Report(check); err != nil {
					log.Printf("agent: report failed: %s", err)
				}
			}
		})(website)
	}
	wg.Wait()
}
