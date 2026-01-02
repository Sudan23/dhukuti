package database

import (
	"fmt"
	"log"

	"github.com/Sudan23/dhukuti/internal/config"
	"github.com/Sudan23/dhukuti/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the database instance
var DB *gorm.DB

// Connect establishes a connection to the database
func Connect(cfg *config.Config) error {
	var err error

	// Configure GORM logger
	logLevel := logger.Info
	if cfg.App.Environment == "production" {
		logLevel = logger.Error
	}

	// Connect to database
	DB, err = gorm.Open(postgres.Open(cfg.GetDSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

// Migrate runs database migrations
func Migrate() error {
	log.Println("Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.Circle{},
		&models.CircleMember{},
	)
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
