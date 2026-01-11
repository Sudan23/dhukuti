package models

// ErrorCode represents standardized error codes
type ErrorCode string

const (
	// Authentication errors
	ErrCodeAuth         ErrorCode = "AUTHENTICATION_ERROR"
	ErrCodeUnauthorized ErrorCode = "UNAUTHORIZED"
	ErrCodeInvalidToken ErrorCode = "INVALID_TOKEN"
	ErrCodeExpiredToken ErrorCode = "EXPIRED_TOKEN"

	// Validation errors
	ErrCodeValidation   ErrorCode = "VALIDATION_ERROR"
	ErrCodeInvalidInput ErrorCode = "INVALID_INPUT"
	ErrCodeMissingField ErrorCode = "MISSING_FIELD"

	// Resource errors
	ErrCodeNotFound      ErrorCode = "NOT_FOUND"
	ErrCodeAlreadyExists ErrorCode = "ALREADY_EXISTS"
	ErrCodeConflict      ErrorCode = "CONFLICT"

	// Permission errors
	ErrCodeForbidden  ErrorCode = "FORBIDDEN"
	ErrCodePermission ErrorCode = "PERMISSION_DENIED"

	// Server errors
	ErrCodeInternal ErrorCode = "INTERNAL_ERROR"
	ErrCodeDatabase ErrorCode = "DATABASE_ERROR"
	ErrCodeExternal ErrorCode = "EXTERNAL_SERVICE_ERROR"
)

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Error   string                 `json:"error"`
	Code    ErrorCode              `json:"code,omitempty"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// NewErrorResponse creates a new error response
func NewErrorResponse(message string, code ErrorCode) *ErrorResponse {
	return &ErrorResponse{
		Error: message,
		Code:  code,
	}
}

// WithDetails adds details to the error response
func (e *ErrorResponse) WithDetails(details map[string]interface{}) *ErrorResponse {
	e.Details = details
	return e
}

// Common error responses
var (
	ErrUnauthorized = &ErrorResponse{
		Error: "Unauthorized access",
		Code:  ErrCodeUnauthorized,
	}

	ErrInvalidCredentials = &ErrorResponse{
		Error: "Invalid email or password",
		Code:  ErrCodeAuth,
	}

	ErrUserNotFound = &ErrorResponse{
		Error: "User not found",
		Code:  ErrCodeNotFound,
	}

	ErrCircleNotFound = &ErrorResponse{
		Error: "Circle not found or you are not a member",
		Code:  ErrCodeNotFound,
	}

	ErrInternalServer = &ErrorResponse{
		Error: "An internal error occurred",
		Code:  ErrCodeInternal,
	}

	ErrForbidden = &ErrorResponse{
		Error: "You do not have permission to perform this action",
		Code:  ErrCodeForbidden,
	}
)
