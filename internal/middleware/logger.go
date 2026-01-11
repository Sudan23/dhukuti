package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestLogger is a middleware that logs HTTP requests with request IDs
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate unique request ID
		requestID := uuid.New().String()
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)

		// Start timer
		startTime := time.Now()

		// Log request
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(startTime)
		statusCode := c.Writer.Status()

		// Log response
		if len(c.Errors) > 0 {
			// Log errors
			for _, e := range c.Errors {
				gin.DefaultErrorWriter.Write([]byte(e.Error() + "\n"))
			}
		}

		// Structured log output
		gin.DefaultWriter.Write([]byte(
			formatLogEntry(requestID, method, path, statusCode, latency, clientIP),
		))
	}
}

func formatLogEntry(requestID, method, path string, status int, latency time.Duration, ip string) string {
	return time.Now().Format("2006/01/02 15:04:05") +
		" | " + requestID +
		" | " + method +
		" | " + path +
		" | " + formatStatus(status) +
		" | " + latency.String() +
		" | " + ip + "\n"
}

func formatStatus(status int) string {
	switch {
	case status >= 500:
		return "\033[31m" + string(rune(status)) + "\033[0m" // Red
	case status >= 400:
		return "\033[33m" + string(rune(status)) + "\033[0m" // Yellow
	case status >= 300:
		return "\033[36m" + string(rune(status)) + "\033[0m" // Cyan
	case status >= 200:
		return "\033[32m" + string(rune(status)) + "\033[0m" // Green
	default:
		return string(rune(status))
	}
}
