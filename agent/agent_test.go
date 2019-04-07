package agent

import "testing"

func TestNew(t *testing.T) {
	a := New("endpoint", "key")
	if a.endpoint != "endpoint" {
		t.Fail()
	}
	if a.key != "key" {
		t.Fail()
	}
}
