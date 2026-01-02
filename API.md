# API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "service": "dhukuti-api"
}
```

---

### Authentication

#### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `name`: Required

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

---

#### POST /api/v1/auth/login
Login with email and password to receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid email or password

---

### Circles

All circle endpoints require authentication.

#### POST /api/v1/circles
Create a new circle. The authenticated user becomes the creator and admin of the circle.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Family Circle",
  "description": "Family savings and expenses"
}
```

**Validation:**
- `name`: Required
- `description`: Optional

**Success Response (201 Created):**
```json
{
  "id": 1,
  "name": "Family Circle",
  "description": "Family savings and expenses",
  "creator_id": 1
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Failed to create circle

---

#### GET /api/v1/circles
List all circles where the authenticated user is a member.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Family Circle",
    "description": "Family savings and expenses",
    "creator_id": 1,
    "members": [
      {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe"
      },
      {
        "id": 2,
        "email": "alice@example.com",
        "name": "Alice Smith"
      }
    ]
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Failed to fetch circles

---

#### POST /api/v1/circles/:id/members
Add a member to a circle. Only circle admins can add members.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Circle ID (integer)

**Request Body:**
```json
{
  "user_id": 2,
  "role": "member"
}
```

**Validation:**
- `user_id`: Required, must be a valid user ID
- `role`: Optional, defaults to "member" (can be "admin" or "member")

**Success Response (201 Created):**
```json
{
  "message": "Member added successfully",
  "circle_id": 1,
  "user_id": 2,
  "role": "member"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data or circle ID
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Only circle admins can add members
- `404 Not Found`: Circle or user not found
- `409 Conflict`: User is already a member of the circle
- `500 Internal Server Error`: Failed to add member

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## JWT Token

JWT tokens are valid for 24 hours by default (configurable via `JWT_EXPIRY_HOURS`).

Token payload includes:
- `user_id`: User's ID
- `email`: User's email
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp
- `nbf`: Not before timestamp

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting in production.

## CORS

CORS is not configured in this version. Configure CORS middleware in production based on your frontend domain.

## Examples

### Complete Flow Example

```bash
# 1. Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "name": "John Doe"
  }'

# Save the token from response
TOKEN="<token_from_response>"

# 2. Create a circle
curl -X POST http://localhost:8080/api/v1/circles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Circle",
    "description": "A circle for shared expenses"
  }'

# 3. Register another user to add as member
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice Smith"
  }'

# Note the user_id from response (e.g., 2)

# 4. Add the new user to your circle
curl -X POST http://localhost:8080/api/v1/circles/1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "user_id": 2,
    "role": "member"
  }'

# 5. List your circles
curl -X GET http://localhost:8080/api/v1/circles \
  -H "Authorization: Bearer $TOKEN"
```

## Security Considerations

1. **Passwords**: All passwords are hashed using bcrypt before storage
2. **JWT Secret**: Change the `JWT_SECRET` environment variable in production
3. **HTTPS**: Always use HTTPS in production
4. **Database**: Use strong database passwords and restrict access
5. **Environment Variables**: Never commit `.env` file to version control
6. **Input Validation**: All inputs are validated using Gin's binding features
7. **SQL Injection**: GORM protects against SQL injection by default
