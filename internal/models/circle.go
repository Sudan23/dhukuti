package models

import (
	"time"

	"gorm.io/gorm"
)

// Circle represents a group/circle in the system
type Circle struct {
	ID              uint           `gorm:"primarykey" json:"id"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	Name            string         `gorm:"not null" json:"name"`
	Description     string         `json:"description"`
	AmountPerMember uint           `gorm:"not null;default:0" json:"amount_per_member"`
	ProposedAmount  uint           `gorm:"default:0" json:"proposed_amount"`
	CreatorID       uint           `gorm:"not null" json:"creator_id"`
	Creator         User           `gorm:"foreignKey:CreatorID" json:"creator,omitempty"`
	Members         []User         `gorm:"many2many:circle_members;" json:"members,omitempty"`
}

// TableName specifies the table name for Circle
func (Circle) TableName() string {
	return "circles"
}

// CircleMember represents the join table for circles and users
type CircleMember struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	CircleID  uint           `gorm:"not null;index:idx_circle_user,priority:1;index:idx_circle_status,priority:1" json:"circle_id"`
	UserID    uint           `gorm:"not null;index:idx_circle_user,priority:2" json:"user_id"`
	Role      string         `gorm:"not null;default:'member'" json:"role"`                                      // admin, member
	Status    string         `gorm:"not null;default:'active';index:idx_circle_status,priority:2" json:"status"` // pending, active
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for CircleMember
func (CircleMember) TableName() string {
	return "circle_members"
}

// MemberApproval tracks individual member votes for a new applicant
type MemberApproval struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	CircleID       uint           `gorm:"not null;index:idx_member_approval,priority:1" json:"circle_id"`
	PendingUserID  uint           `gorm:"not null;index:idx_member_approval,priority:2" json:"pending_user_id"`
	ApproverUserID uint           `gorm:"not null;index:idx_member_approval,priority:3" json:"approver_user_id"`
	Approved       bool           `gorm:"default:false" json:"approved"`
	CreatedAt      time.Time      `json:"created_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// Contribution tracks monthly savings/payments
type Contribution struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CircleID  uint           `gorm:"not null;index:idx_contribution,priority:1" json:"circle_id"`
	UserID    uint           `gorm:"not null;index:idx_contribution,priority:2" json:"user_id"`
	Amount    uint           `gorm:"not null" json:"amount"`
	Month     time.Time      `gorm:"not null" json:"month"` // Used to track periodic savings
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// AmountApproval tracks individual member votes for a proposed amount change
type AmountApproval struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	CircleID       uint           `gorm:"not null;index:idx_amount_approval,priority:1" json:"circle_id"`
	ProposerID     uint           `gorm:"not null" json:"proposer_id"`
	ProposedAmount uint           `gorm:"not null" json:"proposed_amount"`
	ApproverID     uint           `gorm:"not null;index:idx_amount_approval,priority:2" json:"approver_id"`
	Approved       bool           `gorm:"default:false" json:"approved"`
	CreatedAt      time.Time      `json:"created_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
