package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/Sudan23/dhukuti/internal/database"
	"github.com/Sudan23/dhukuti/internal/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// PasswordResetHandler handles password reset operations
type PasswordResetHandler struct{}

// NewPasswordResetHandler creates a new password reset handler
func NewPasswordResetHandler() *PasswordResetHandler {
	return &PasswordResetHandler{}
}

// RequestPasswordResetRequest represents the request body
type RequestPasswordResetRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest represents the reset password request body
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// RequestPasswordReset initiates a password reset request
func (h *PasswordResetHandler) RequestPasswordReset(c *gin.Context) {
	var req RequestPasswordResetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(err.Error(), models.ErrCodeValidation))
		return
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// Don't reveal if user exists or not for security
		c.JSON(http.StatusOK, gin.H{
			"message": "If an account with that email exists, a password reset link has been sent.",
		})
		return
	}

	// Generate random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to generate reset token",
			models.ErrCodeInternal,
		))
		return
	}
	token := hex.EncodeToString(tokenBytes)

	// Hash the token for storage
	hashedToken, err := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to hash token",
			models.ErrCodeInternal,
		))
		return
	}

	// Invalidate any existing tokens for this user
	database.DB.Model(&models.PasswordResetToken{}).
		Where("user_id = ? AND used = ?", user.ID, false).
		Update("used", true)

	// Create new reset token (expires in 1 hour)
	resetToken := models.PasswordResetToken{
		UserID:    user.ID,
		Token:     string(hashedToken),
		ExpiresAt: time.Now().Add(1 * time.Hour),
		Used:      false,
	}

	if err := database.DB.Create(&resetToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to create reset token",
			models.ErrCodeDatabase,
		))
		return
	}

	// TODO: Send email with reset link containing the token
	// For now, we'll return the token in the response (ONLY FOR DEVELOPMENT)
	// In production, this should be sent via email
	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset link has been sent to your email.",
		"token":   token, // REMOVE THIS IN PRODUCTION
	})
}

// ResetPassword resets the user's password using a valid token
func (h *PasswordResetHandler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(err.Error(), models.ErrCodeValidation))
		return
	}

	// Find all unused, non-expired tokens
	var tokens []models.PasswordResetToken
	if err := database.DB.Where("used = ? AND expires_at > ?", false, time.Now()).
		Find(&tokens).Error; err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(
			"Invalid or expired reset token",
			models.ErrCodeInvalidToken,
		))
		return
	}

	// Find matching token by comparing hashes
	var validToken *models.PasswordResetToken
	for i := range tokens {
		if err := bcrypt.CompareHashAndPassword([]byte(tokens[i].Token), []byte(req.Token)); err == nil {
			validToken = &tokens[i]
			break
		}
	}

	if validToken == nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse(
			"Invalid or expired reset token",
			models.ErrCodeInvalidToken,
		))
		return
	}

	// Get the user
	var user models.User
	if err := database.DB.First(&user, validToken.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, models.ErrUserNotFound)
		return
	}

	// Update password
	if err := user.HashPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to hash password",
			models.ErrCodeInternal,
		))
		return
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse(
			"Failed to update password",
			models.ErrCodeDatabase,
		))
		return
	}

	// Mark token as used
	validToken.Used = true
	database.DB.Save(validToken)

	c.JSON(http.StatusOK, gin.H{
		"message": "Password has been reset successfully. You can now login with your new password.",
	})
}
