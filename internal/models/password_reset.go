package models

import (
	"time"

	"gorm.io/gorm"
)

// PasswordResetToken represents a password reset request
type PasswordResetToken struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	UserID    uint           `gorm:"not null;index" json:"user_id"`
	Token     string         `gorm:"not null;uniqueIndex" json:"-"` // hashed token
	ExpiresAt time.Time      `gorm:"not null" json:"expires_at"`
	Used      bool           `gorm:"default:false" json:"used"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// IsValid checks if the token is still valid
func (t *PasswordResetToken) IsValid() bool {
	return !t.Used && time.Now().Before(t.ExpiresAt)
}
