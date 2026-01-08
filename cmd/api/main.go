package main

import (
	"log"
	"os"

	"github.com/Sudan23/dhukuti/internal/config"
	"github.com/Sudan23/dhukuti/internal/database"
	"github.com/Sudan23/dhukuti/internal/handlers"
	"github.com/Sudan23/dhukuti/internal/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(cfg)
	circleHandler := handlers.NewCircleHandler()

	// Setup router
	router := gin.Default()

	// CORS Middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "dhukuti-api",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			// Circle routes
			circles := protected.Group("/circles")
			{
				circles.POST("", circleHandler.CreateCircle)
				circles.GET("", circleHandler.ListCircles)
				circles.GET("/:id", circleHandler.GetCircle)
				circles.POST("/:id/members", circleHandler.AddMember)
				circles.POST("/:id/approve/:user_id", circleHandler.ApproveMember)
				circles.POST("/:id/contributions", circleHandler.RecordContribution)
				circles.POST("/:id/propose-amount", circleHandler.ProposeAmount)
				circles.POST("/:id/approve-amount", circleHandler.ApproveAmountChange)
			}
		}
	}

	// Start server
	port := cfg.Server.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// init loads environment variables from .env file if it exists
func init() {
	// Try to load .env file, but don't fail if it doesn't exist
	if _, err := os.Stat(".env"); err == nil {
		log.Println("Note: For .env file support, consider using godotenv package")
	}
}
