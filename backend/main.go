
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/vjeantet/grok"
)

type Pattern struct {
	Name    string `json:"name"`
	Pattern string `json:"pattern"`
}

type ValidationRequest struct {
	LogLines []string  `json:"logLines"`
	Patterns []Pattern `json:"patterns"`
}

type ParsedResult struct {
	LineNumber int               `json:"lineNumber"`
	Line       string           `json:"line"`
	Parsed     map[string]string `json:"parsed,omitempty"`
	Error      string           `json:"error,omitempty"`
}

type ValidationResponse struct {
	Success bool           `json:"success"`
	Results []ParsedResult `json:"results"`
	Error   string        `json:"error,omitempty"`
}

func main() {
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	r.Use(cors.New(config))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Root endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to Grok Pattern Validator API. Use /api/validate for validating patterns.",
		})
	})

	// Validation endpoint
	r.POST("/api/validate", validatePatterns)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func validatePatterns(c *gin.Context) {
	var req ValidationRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ValidationResponse{
			Success: false,
			Error:   "Invalid request format",
		})
		return
	}

	if len(req.LogLines) == 0 {
		c.JSON(http.StatusBadRequest, ValidationResponse{
			Success: false,
			Error:   "No log lines provided",
		})
		return
	}

	if len(req.Patterns) == 0 {
		c.JSON(http.StatusBadRequest, ValidationResponse{
			Success: false,
			Error:   "No patterns provided",
		})
		return
	}

	g, _ := grok.NewWithConfig(&grok.Config{NamedCapturesOnly: true})

	results := make([]ParsedResult, 0)
	for i, line := range req.LogLines {
		if line == "" {
			results = append(results, ParsedResult{
				LineNumber: i + 1,
				Line:      line,
				Error:     "Empty log line",
			})
			continue
		}

		var matched bool
		var parsed map[string]string
		var lastError string

		for _, pattern := range req.Patterns {
			values, err := g.Parse(pattern.Pattern, line)
			if err != nil {
				lastError = err.Error()
				continue
			}
			if len(values) > 0 {
				matched = true
				parsed = values
				break
			}
		}

		result := ParsedResult{
			LineNumber: i + 1,
			Line:      line,
			Parsed:    parsed,
		}

		if !matched && lastError != "" {
			result.Error = lastError
		}

		results = append(results, result)
	}

	c.JSON(http.StatusOK, ValidationResponse{
		Success: true,
		Results: results,
	})
}
