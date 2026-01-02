package models

import (
	"time"

	"gorm.io/gorm"
)

// Circle represents a group/circle in the system
type Circle struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	CreatorID   uint           `gorm:"not null" json:"creator_id"`
	Creator     User           `gorm:"foreignKey:CreatorID" json:"creator,omitempty"`
	Members     []User         `gorm:"many2many:circle_members;" json:"members,omitempty"`
}

// TableName specifies the table name for Circle
func (Circle) TableName() string {
	return "circles"
}

// CircleMember represents the join table for circles and users
type CircleMember struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	CircleID  uint           `gorm:"not null;index" json:"circle_id"`
	UserID    uint           `gorm:"not null;index" json:"user_id"`
	Role      string         `gorm:"default:'member'" json:"role"` // admin, member
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for CircleMember
func (CircleMember) TableName() string {
	return "circle_members"
}
