package main

import (
	"log"

	"github.com/Sudan23/dhukuti/internal/config"
	"github.com/Sudan23/dhukuti/internal/database"
	"github.com/Sudan23/dhukuti/internal/models"
)

func main() {
	log.Println("Starting database seed...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Create sample users
	users := []models.User{
		{Email: "alice@example.com", Name: "Alice Smith"},
		{Email: "bob@example.com", Name: "Bob Johnson"},
		{Email: "charlie@example.com", Name: "Charlie Brown"},
	}

	for i := range users {
		if err := users[i].HashPassword("password123"); err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}

		// Check if user already exists
		var existingUser models.User
		if err := database.DB.Where("email = ?", users[i].Email).First(&existingUser).Error; err == nil {
			log.Printf("User %s already exists, skipping", users[i].Email)
			users[i] = existingUser
			continue
		}

		if err := database.DB.Create(&users[i]).Error; err != nil {
			log.Fatalf("Failed to create user: %v", err)
		}
		log.Printf("Created user: %s", users[i].Email)
	}

	// Create sample circles
	circles := []models.Circle{
		{
			Name:            "Family Circle",
			Description:     "Family savings and expenses",
			AmountPerMember: 1000,
			CreatorID:       users[0].ID,
		},
		{
			Name:            "Friends Group",
			Description:     "Friends' shared expenses",
			AmountPerMember: 500,
			CreatorID:       users[1].ID,
		},
	}

	for i := range circles {
		// Check if circle already exists
		var existingCircle models.Circle
		if err := database.DB.Where("name = ? AND creator_id = ?", circles[i].Name, circles[i].CreatorID).First(&existingCircle).Error; err == nil {
			log.Printf("Circle %s already exists, skipping", circles[i].Name)
			continue
		}

		if err := database.DB.Create(&circles[i]).Error; err != nil {
			log.Fatalf("Failed to create circle: %v", err)
		}
		log.Printf("Created circle: %s", circles[i].Name)

		// Add creator as admin
		member := models.CircleMember{
			CircleID: circles[i].ID,
			UserID:   circles[i].CreatorID,
			Role:     "admin",
			Status:   "active",
		}
		if err := database.DB.Create(&member).Error; err != nil {
			log.Fatalf("Failed to add creator as member: %v", err)
		}
	}

	// Add members to circles
	// Add Bob to Alice's family circle
	if len(circles) > 0 {
		familyMember := models.CircleMember{
			CircleID: circles[0].ID,
			UserID:   users[1].ID,
			Role:     "member",
			Status:   "active",
		}
		var existing models.CircleMember
		if err := database.DB.Where("circle_id = ? AND user_id = ?", familyMember.CircleID, familyMember.UserID).First(&existing).Error; err != nil {
			if err := database.DB.Create(&familyMember).Error; err != nil {
				log.Fatalf("Failed to add member: %v", err)
			}
			log.Printf("Added Bob to Family Circle")
		}
	}

	log.Println("Database seed completed successfully!")
}
