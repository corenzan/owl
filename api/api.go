package api

import (
	"time"
)

type (
	// Website ...
	Website struct {
		ID      uint      `json:"id"`
		Updated time.Time `json:"updatedAt" db:"updated_at"`
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
		WebsiteID uint      `json:"websiteId,omitempty" db:"website_id"`
		Checked   time.Time `json:"checkedAt" db:"checked_at"`
		Result    string    `json:"result"`
		Latency   *Latency  `json:"latency"`
	}

	// Stats ...
	Stats struct {
		Uptime  float64 `json:"uptime"`
		Apdex   float64 `json:"apdex"`
		Average float64 `json:"average"`
		Lowest  float64 `json:"lowest"`
		Highest float64 `json:"highest"`
		Count   uint    `json:"count"`
	}

	// Entry ...
	Entry struct {
		Time     time.Time     `json:"time"`
		Status   string        `json:"status"`
		Duration time.Duration `json:"duration"`
	}
)

// Website status enumaration.
const (
	StatusUnknown     = "unknown"
	StatusUp          = "up"
	StatusMaintenance = "maintenance"
	StatusDown        = "down"
)

// Check result enumaration.
const (
	ResultUp   = "up"
	ResultDown = "down"
)
