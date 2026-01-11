package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/Sudan23/dhukuti/internal/database"
	"github.com/Sudan23/dhukuti/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CircleHandler handles circle operations
type CircleHandler struct{}

// NewCircleHandler creates a new circle handler
func NewCircleHandler() *CircleHandler {
	return &CircleHandler{}
}

// CreateCircleRequest represents a request to create a circle
type CreateCircleRequest struct {
	Name            string `json:"name" binding:"required"`
	Description     string `json:"description"`
	AmountPerMember uint   `json:"amount_per_member" binding:"required"`
}

// AddMemberRequest represents a request to add a member to a circle
type AddMemberRequest struct {
	UserID uint   `json:"user_id" binding:"required"`
	Role   string `json:"role"` // admin, member (defaults to member)
}

// MemberResponse represents a circle member with status
type MemberResponse struct {
	ID     uint   `json:"id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Role   string `json:"role"`
	Status string `json:"status"`
}

// CircleResponse represents a circle in responses
type CircleResponse struct {
	ID                  uint             `json:"id"`
	Name                string           `json:"name"`
	Description         string           `json:"description"`
	AmountPerMember     uint             `json:"amount_per_member"`
	ProposedAmount      uint             `json:"proposed_amount"`
	CreatorID           uint             `json:"creator_id"`
	Members             []MemberResponse `json:"members,omitempty"`
	PendingApprovals    []uint           `json:"pending_approvals,omitempty"`
	NeedsAmountApproval bool             `json:"needs_amount_approval"`
	AmountApprovals     []ApprovalStatus `json:"amount_approvals,omitempty"`
}

// ApprovalStatus represents a member's approval status for amount change
type ApprovalStatus struct {
	UserID   uint   `json:"user_id"`
	UserName string `json:"user_name"`
	Approved bool   `json:"approved"`
}

// GetCircle returns details for a specific circle
func (h *CircleHandler) GetCircle(c *gin.Context) {
	circleID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid circle ID"})
		return
	}

	// Get authenticated user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Check if circle exists and user is a member
	var circle models.Circle
	// Join with members to verify membership efficiently
	if err := database.DB.
		Joins("JOIN circle_members ON circle_members.circle_id = circles.id").
		Where("circles.id = ? AND circle_members.user_id = ?", circleID, userID).
		Preload("Members").
		First(&circle).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Circle not found or you are not a member"})
		return
	}

	// Fetch members with their status for this circle
	var memberStatus []models.CircleMember
	database.DB.Where("circle_id = ?", circle.ID).Find(&memberStatus)

	statusMap := make(map[uint]string)
	roleMap := make(map[uint]string)
	for _, ms := range memberStatus {
		statusMap[ms.UserID] = ms.Status
		roleMap[ms.UserID] = ms.Role
	}

	members := make([]MemberResponse, len(circle.Members))
	for j, member := range circle.Members {
		members[j] = MemberResponse{
			ID:     member.ID,
			Email:  member.Email,
			Name:   member.Name,
			Role:   roleMap[member.ID],
			Status: statusMap[member.ID],
		}
	}

	// Fetch pending member approvals for the current user in this circle
	var pendingApprovals []uint
	database.DB.Model(&models.MemberApproval{}).
		Where("circle_id = ? AND approver_user_id = ? AND approved = ?", circle.ID, userID, false).
		Pluck("pending_user_id", &pendingApprovals)

	// Fetch pending amount approvals for the current user
	var amountApprovals []models.AmountApproval
	database.DB.Model(&models.AmountApproval{}).
		Where("circle_id = ?", circle.ID).
		Find(&amountApprovals)

	var amountApprovalResponse []ApprovalStatus
	var amountApprovalCount int64

	// Create a map for quick lookup of approvals
	approvalMap := make(map[uint]bool)
	for _, app := range amountApprovals {
		approvalMap[app.ApproverID] = app.Approved
		if app.ApproverID == userID.(uint) && !app.Approved {
			amountApprovalCount++
		}
	}

	// Build the response list ensuring all active members are represented
	for _, m := range circle.Members {
		// Only consider active members for amount approval
		if statusMap[m.ID] == "active" {
			approved, found := approvalMap[m.ID]
			// If not found in approval records (shouldn't happen if logic is correct, but safe fallback), assume false
			if !found {
				approved = false
			}
			amountApprovalResponse = append(amountApprovalResponse, ApprovalStatus{
				UserID:   m.ID,
				UserName: m.Name,
				Approved: approved,
			})
		}
	}

	response := CircleResponse{
		ID:                  circle.ID,
		Name:                circle.Name,
		Description:         circle.Description,
		AmountPerMember:     circle.AmountPerMember,
		ProposedAmount:      circle.ProposedAmount,
		CreatorID:           circle.CreatorID,
		Members:             members,
		PendingApprovals:    pendingApprovals,
		NeedsAmountApproval: amountApprovalCount > 0,
		AmountApprovals:     amountApprovalResponse,
	}

	c.JSON(http.StatusOK, response)
}

// ProposeAmountRequest represents a request to change the saving amount
type ProposeAmountRequest struct {
	NewAmount uint `json:"new_amount" binding:"required,min=1"`
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
		Name:            req.Name,
		Description:     req.Description,
		AmountPerMember: req.AmountPerMember,
		CreatorID:       userID.(uint),
	}

	if err := database.DB.Create(&circle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create circle"})
		return
	}

	// Add creator as active admin member
	circleMember := models.CircleMember{
		CircleID: circle.ID,
		UserID:   userID.(uint),
		Role:     "admin",
		Status:   "active",
	}

	if err := database.DB.Create(&circleMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add creator as member"})
		return
	}

	c.JSON(http.StatusCreated, CircleResponse{
		ID:              circle.ID,
		Name:            circle.Name,
		Description:     circle.Description,
		AmountPerMember: circle.AmountPerMember,
		CreatorID:       circle.CreatorID,
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

	// Add member as pending
	circleMember := models.CircleMember{
		CircleID: uint(circleID),
		UserID:   req.UserID,
		Role:     role,
		Status:   "pending",
	}

	if err := database.DB.Create(&circleMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member"})
		return
	}

	// Create MemberApproval records for all existing active members
	var activeMembers []models.CircleMember
	database.DB.Where("circle_id = ? AND status = ?", circleID, "active").Find(&activeMembers)

	for _, m := range activeMembers {
		approval := models.MemberApproval{
			CircleID:       uint(circleID),
			PendingUserID:  req.UserID,
			ApproverUserID: m.UserID,
			Approved:       m.UserID == userID.(uint), // Auto-approve if the inviter is an active member
		}
		database.DB.Create(&approval)
	}

	// Double check if it's already approved (e.g. if the only active member was the inviter)
	checkApprovalCompletion(uint(circleID), req.UserID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Invitation sent. Requires approval from all members.",
	})
}

// checkApprovalCompletion checks if all members have approved a pending user
func checkApprovalCompletion(circleID uint, pendingUserID uint) {
	var totalRequired int64
	var totalApproved int64
	database.DB.Model(&models.MemberApproval{}).Where("circle_id = ? AND pending_user_id = ?", circleID, pendingUserID).Count(&totalRequired)
	database.DB.Model(&models.MemberApproval{}).Where("circle_id = ? AND pending_user_id = ? AND approved = ?", circleID, pendingUserID, true).Count(&totalApproved)

	if totalRequired > 0 && totalRequired == totalApproved {
		database.DB.Model(&models.CircleMember{}).
			Where("circle_id = ? AND user_id = ?", circleID, pendingUserID).
			Update("status", "active")
	}
}

// ApproveMember allows a member to approve a pending user
func (h *CircleHandler) ApproveMember(c *gin.Context) {
	circleID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	pendingUserID, _ := strconv.ParseUint(c.Param("user_id"), 10, 32)
	approverID, _ := c.Get("user_id")

	result := database.DB.Model(&models.MemberApproval{}).
		Where("circle_id = ? AND pending_user_id = ? AND approver_user_id = ?", circleID, pendingUserID, approverID).
		Update("approved", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve member"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Approval record not found or you are not an approver"})
		return
	}

	checkApprovalCompletion(uint(circleID), uint(pendingUserID))

	c.JSON(http.StatusOK, gin.H{"message": "Member approved"})
}

// RecordContribution allows a member to record their saving
func (h *CircleHandler) RecordContribution(c *gin.Context) {
	circleID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID, _ := c.Get("user_id")

	var circle models.Circle
	if err := database.DB.First(&circle, circleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Circle not found"})
		return
	}

	// Verify membership is active
	var member models.CircleMember
	if err := database.DB.Where("circle_id = ? AND user_id = ? AND status = ?", circleID, userID, "active").First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only active members can contribute"})
		return
	}

	contribution := models.Contribution{
		CircleID: uint(circleID),
		UserID:   userID.(uint),
		Amount:   circle.AmountPerMember,
		// Assuming monthly for now, just records current timestamp's month
	}

	if err := database.DB.Create(&contribution).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record contribution"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Contribution recorded"})
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

	// Collect all circle IDs for batch queries
	circleIDs := make([]uint, len(circles))
	for i, circle := range circles {
		circleIDs[i] = circle.ID
	}

	// Batch fetch all member statuses for all circles
	var allMemberStatuses []models.CircleMember
	if len(circleIDs) > 0 {
		database.DB.Where("circle_id IN ?", circleIDs).Find(&allMemberStatuses)
	}

	// Group member statuses by circle ID
	memberStatusByCircle := make(map[uint][]models.CircleMember)
	for _, ms := range allMemberStatuses {
		memberStatusByCircle[ms.CircleID] = append(memberStatusByCircle[ms.CircleID], ms)
	}

	// Batch fetch pending approvals for all circles
	var allPendingApprovals []struct {
		CircleID      uint
		PendingUserID uint
	}
	if len(circleIDs) > 0 {
		database.DB.Model(&models.MemberApproval{}).
			Select("circle_id, pending_user_id").
			Where("circle_id IN ? AND approver_user_id = ? AND approved = ?", circleIDs, userID, false).
			Find(&allPendingApprovals)
	}

	// Group pending approvals by circle ID
	pendingApprovalsByCircle := make(map[uint][]uint)
	for _, pa := range allPendingApprovals {
		pendingApprovalsByCircle[pa.CircleID] = append(pendingApprovalsByCircle[pa.CircleID], pa.PendingUserID)
	}

	// Batch fetch amount approval counts for all circles
	var amountApprovalCounts []struct {
		CircleID uint
		Count    int64
	}
	if len(circleIDs) > 0 {
		database.DB.Model(&models.AmountApproval{}).
			Select("circle_id, COUNT(*) as count").
			Where("circle_id IN ? AND approver_id = ? AND approved = ?", circleIDs, userID, false).
			Group("circle_id").
			Find(&amountApprovalCounts)
	}

	// Create a map for quick lookup
	amountApprovalCountMap := make(map[uint]int64)
	for _, aac := range amountApprovalCounts {
		amountApprovalCountMap[aac.CircleID] = aac.Count
	}

	// Convert to response format
	response := make([]CircleResponse, len(circles))
	for i, circle := range circles {
		memberStatuses := memberStatusByCircle[circle.ID]

		statusMap := make(map[uint]string)
		roleMap := make(map[uint]string)
		for _, ms := range memberStatuses {
			statusMap[ms.UserID] = ms.Status
			roleMap[ms.UserID] = ms.Role
		}

		members := make([]MemberResponse, len(circle.Members))
		for j, member := range circle.Members {
			members[j] = MemberResponse{
				ID:     member.ID,
				Email:  member.Email,
				Name:   member.Name,
				Role:   roleMap[member.ID],
				Status: statusMap[member.ID],
			}
		}

		response[i] = CircleResponse{
			ID:                  circle.ID,
			Name:                circle.Name,
			Description:         circle.Description,
			AmountPerMember:     circle.AmountPerMember,
			ProposedAmount:      circle.ProposedAmount,
			CreatorID:           circle.CreatorID,
			Members:             members,
			PendingApprovals:    pendingApprovalsByCircle[circle.ID],
			NeedsAmountApproval: amountApprovalCountMap[circle.ID] > 0,
		}
		log.Printf("[ListCircles] Circle %d: Amount=%d, Proposed=%d, NeedsApproval=%v", circle.ID, circle.AmountPerMember, circle.ProposedAmount, amountApprovalCountMap[circle.ID] > 0)
	}

	c.JSON(http.StatusOK, response)
}

// ProposeAmount allows an admin to propose a new saving amount
func (h *CircleHandler) ProposeAmount(c *gin.Context) {
	circleID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID, _ := c.Get("user_id")

	var req ProposeAmountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify the user is an admin
	var member models.CircleMember
	if err := database.DB.Where("circle_id = ? AND user_id = ? AND role = ?", circleID, userID, "admin").First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can propose amount changes"})
		return
	}

	// Update the circle with the proposed amount
	if err := database.DB.Model(&models.Circle{}).Where("id = ?", circleID).Update("proposed_amount", req.NewAmount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to propose amount"})
		return
	}

	// Clear old approvals and create new ones for all active members
	database.DB.Unscoped().Where("circle_id = ?", circleID).Delete(&models.AmountApproval{})

	var activeMembers []models.CircleMember
	database.DB.Where("circle_id = ? AND status = ?", circleID, "active").Find(&activeMembers)

	for _, m := range activeMembers {
		approval := models.AmountApproval{
			CircleID:       uint(circleID),
			ProposerID:     userID.(uint),
			ProposedAmount: req.NewAmount,
			ApproverID:     m.UserID,
			Approved:       m.UserID == userID.(uint),
		}
		database.DB.Create(&approval)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Amount change proposed and requires member approval"})
}

// ApproveAmountChange allows a member to approve a proposed amount change
func (h *CircleHandler) ApproveAmountChange(c *gin.Context) {
	circleID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid circle ID"})
		return
	}
	userID, _ := c.Get("user_id")

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Update the approval for this user
		result := tx.Model(&models.AmountApproval{}).
			Where("circle_id = ? AND approver_id = ? AND approved = ?", circleID, userID, false).
			Update("approved", true)

		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected == 0 {
			return fmt.Errorf("no pending amount approval found for user %d in circle %d", userID, circleID)
		}

		// 2. Check if all active members have now approved
		var totalRequired int64
		var totalApproved int64
		tx.Model(&models.AmountApproval{}).Where("circle_id = ?", uint(circleID)).Count(&totalRequired)
		tx.Model(&models.AmountApproval{}).Where("circle_id = ? AND approved = ?", uint(circleID), true).Count(&totalApproved)

		log.Printf("[ApproveAmountChange] Circle %d: totalRequired=%d, totalApproved=%d", circleID, totalRequired, totalApproved)

		if totalRequired > 0 && totalRequired == totalApproved {
			// 3. Get the proposed amount from any of the approval records
			var approval models.AmountApproval
			if err := tx.Where("circle_id = ?", uint(circleID)).First(&approval).Error; err != nil {
				return err
			}

			log.Printf("[ApproveAmountChange] Circle %d: Consensus reached. Finalizing amount to %d", circleID, approval.ProposedAmount)

			// 4. Update the circle's official amount and reset the proposal
			// We use a map to ensure GORM doesn't skip the '0' value for proposed_amount
			updateData := map[string]interface{}{
				"amount_per_member": approval.ProposedAmount,
				"proposed_amount":   0,
			}
			if err := tx.Model(&models.Circle{}).Where("id = ?", uint(circleID)).Updates(updateData).Error; err != nil {
				return err
			}

			// 5. Clear the approval records as they are no longer needed
			if err := tx.Unscoped().Where("circle_id = ?", uint(circleID)).Delete(&models.AmountApproval{}).Error; err != nil {
				return err
			}

			log.Printf("[ApproveAmountChange] Circle %d: Finalization complete.", circleID)
		}
		return nil
	})

	if err != nil {
		log.Printf("[ApproveAmountChange] Transaction failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Amount change approved"})
}
