package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Sudan23/dhukuti/internal/database"
	"github.com/Sudan23/dhukuti/internal/models"
	"github.com/gin-gonic/gin"
)

// ContributionResponse represents a contribution in responses
type ContributionResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	UserName  string    `json:"user_name"`
	UserEmail string    `json:"user_email"`
	Amount    uint      `json:"amount"`
	Month     time.Time `json:"month"`
	CreatedAt time.Time `json:"created_at"`
}

// GetContributions retrieves all contributions for a circle
func (h *CircleHandler) GetContributions(c *gin.Context) {
	circleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(
			"Invalid circle ID",
			models.ErrCodeValidation,
		))
		return
	}

	// Get authenticated user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrUnauthorized)
		return
	}

	// Verify user is a member of the circle
	var membership models.CircleMember
	if err := database.DB.Where("circle_id = ? AND user_id = ?", circleID, userID).
		First(&membership).Error; err != nil {
		c.JSON(http.StatusForbidden, models.ErrCircleNotFound)
		return
	}

	// Fetch all contributions for this circle with user details
	var contributions []models.Contribution
	if err := database.DB.Where("circle_id = ?", circleID).
		Order("created_at DESC").
		Find(&contributions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to fetch contributions",
			models.ErrCodeDatabase,
		))
		return
	}

	// Get all unique user IDs
	userIDs := make([]uint, 0)
	userIDMap := make(map[uint]bool)
	for _, contrib := range contributions {
		if !userIDMap[contrib.UserID] {
			userIDs = append(userIDs, contrib.UserID)
			userIDMap[contrib.UserID] = true
		}
	}

	// Batch fetch user details
	var users []models.User
	if len(userIDs) > 0 {
		database.DB.Where("id IN ?", userIDs).Find(&users)
	}

	// Create user lookup map
	userMap := make(map[uint]models.User)
	for _, user := range users {
		userMap[user.ID] = user
	}

	// Build response
	response := make([]ContributionResponse, len(contributions))
	for i, contrib := range contributions {
		user := userMap[contrib.UserID]
		response[i] = ContributionResponse{
			ID:        contrib.ID,
			UserID:    contrib.UserID,
			UserName:  user.Name,
			UserEmail: user.Email,
			Amount:    contrib.Amount,
			Month:     contrib.Month,
			CreatedAt: contrib.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response)
}
