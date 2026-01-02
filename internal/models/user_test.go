package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUserHashPassword(t *testing.T) {
	user := &User{
		Email: "test@example.com",
		Name:  "Test User",
	}

	password := "password123"
	err := user.HashPassword(password)

	assert.NoError(t, err)
	assert.NotEmpty(t, user.Password)
	assert.NotEqual(t, password, user.Password, "Password should be hashed")
}

func TestUserCheckPassword(t *testing.T) {
	user := &User{
		Email: "test@example.com",
		Name:  "Test User",
	}

	password := "password123"
	err := user.HashPassword(password)
	assert.NoError(t, err)

	// Test correct password
	err = user.CheckPassword(password)
	assert.NoError(t, err, "Correct password should pass")

	// Test incorrect password
	err = user.CheckPassword("wrongpassword")
	assert.Error(t, err, "Incorrect password should fail")
}
