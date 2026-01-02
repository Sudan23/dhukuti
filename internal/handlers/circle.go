package handlers

import (
	"net/http"
	"strconv"

	"github.com/Sudan23/dhukuti/internal/database"
	"github.com/Sudan23/dhukuti/internal/models"
	"github.com/gin-gonic/gin"
)

// CircleHandler handles circle operations
type CircleHandler struct{}

// NewCircleHandler creates a new circle handler
func NewCircleHandler() *CircleHandler {
	return &CircleHandler{}
}

// CreateCircleRequest represents a request to create a circle
type CreateCircleRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// AddMemberRequest represents a request to add a member to a circle
type AddMemberRequest struct {
	UserID uint   `json:"user_id" binding:"required"`
	Role   string `json:"role"` // admin, member (defaults to member)
}

// CircleResponse represents a circle in responses
type CircleResponse struct {
	ID          uint           `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	CreatorID   uint           `json:"creator_id"`
	Members     []UserResponse `json:"members,omitempty"`
}

// CreateCircle handles circle creation
func (h *CircleHandler) CreateCircle(c *gin.Context) {
	var req CreateCircleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get authenticated user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Create circle
	circle := models.Circle{
		Name:        req.Name,
		Description: req.Description,
		CreatorID:   userID.(uint),
	}

	if err := database.DB.Create(&circle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create circle"})
		return
	}

	// Add creator as admin member
	circleMember := models.CircleMember{
		CircleID: circle.ID,
		UserID:   userID.(uint),
		Role:     "admin",
	}

	if err := database.DB.Create(&circleMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add creator as member"})
		return
	}

	c.JSON(http.StatusCreated, CircleResponse{
		ID:          circle.ID,
		Name:        circle.Name,
		Description: circle.Description,
		CreatorID:   circle.CreatorID,
	})
}

// AddMember adds a member to a circle
func (h *CircleHandler) AddMember(c *gin.Context) {
	circleID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid circle ID"})
		return
	}

	var req AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get authenticated user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Check if circle exists
	var circle models.Circle
	if err := database.DB.First(&circle, circleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Circle not found"})
		return
	}

	// Check if authenticated user is admin of the circle
	var existingMember models.CircleMember
	if err := database.DB.Where("circle_id = ? AND user_id = ? AND role = ?", circleID, userID, "admin").First(&existingMember).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only circle admins can add members"})
		return
	}

	// Check if user to be added exists
	var newUser models.User
	if err := database.DB.First(&newUser, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if user is already a member
	var checkMember models.CircleMember
	if err := database.DB.Where("circle_id = ? AND user_id = ?", circleID, req.UserID).First(&checkMember).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User is already a member of this circle"})
		return
	}

	// Default role to member if not specified
	role := req.Role
	if role == "" {
		role = "member"
	}

	// Add member
	circleMember := models.CircleMember{
		CircleID: uint(circleID),
		UserID:   req.UserID,
		Role:     role,
	}

	if err := database.DB.Create(&circleMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Member added successfully",
		"circle_id": circleID,
		"user_id":   req.UserID,
		"role":      role,
	})
}

// ListCircles lists all circles for the authenticated user
func (h *CircleHandler) ListCircles(c *gin.Context) {
	// Get authenticated user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get all circles where user is a member
	var circles []models.Circle
	err := database.DB.
		Joins("JOIN circle_members ON circle_members.circle_id = circles.id").
		Where("circle_members.user_id = ?", userID).
		Preload("Members").
		Find(&circles).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch circles"})
		return
	}

	// Convert to response format
	response := make([]CircleResponse, len(circles))
	for i, circle := range circles {
		members := make([]UserResponse, len(circle.Members))
		for j, member := range circle.Members {
			members[j] = UserResponse{
				ID:    member.ID,
				Email: member.Email,
				Name:  member.Name,
			}
		}

		response[i] = CircleResponse{
			ID:          circle.ID,
			Name:        circle.Name,
			Description: circle.Description,
			CreatorID:   circle.CreatorID,
			Members:     members,
		}
	}

	c.JSON(http.StatusOK, response)
}
