# Dhukuti - Money Sharing Application

A mobile and web application backend API to share money within a close circle.

## Overview

Dhukuti is a Go-based backend API that enables users to create circles (groups) and manage shared money within those circles. The application uses modern technologies including:

- **Go 1.22+** - Programming language
- **Gin** - HTTP web framework
- **GORM** - ORM with PostgreSQL (pgx driver)
- **JWT** - Authentication
- **PostgreSQL** - Database
- **Docker Compose** - Container orchestration
- **GitHub Actions** - CI/CD

## Features

### MVP Features
- ✅ User registration with email and password
- ✅ User login with JWT token issuance
- ✅ Password hashing with bcrypt
- ✅ Create circles (groups)
- ✅ Add members to circles
- ✅ List user's circles

## Prerequisites

- Go 1.22 or higher
- Docker and Docker Compose
- Make (optional, for using Makefile commands)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Sudan23/dhukuti.git
cd dhukuti
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration (default values work for local development).

### 3. Start the database

```bash
make docker-up
```

Or without Make:

```bash
docker-compose up -d postgres
```

### 4. Run the application

```bash
make run
```

Or without Make:

```bash
go run ./cmd/api/main.go
```

The API will be available at `http://localhost:8080`

### 5. Seed the database (optional)

```bash
make seed
```

Or without Make:

```bash
go run ./scripts/seed.go
```

## Docker Deployment

Build and run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

Or using Make:

```bash
make docker-build
```

## API Endpoints

### Health Check
- `GET /health` - Check API health

### Authentication (Public)
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Circles (Protected - requires JWT)
- `POST /api/v1/circles` - Create a new circle
- `GET /api/v1/circles` - List user's circles
- `POST /api/v1/circles/:id/members` - Add member to circle

## API Documentation

### Register User

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
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

### Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
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

### Create Circle

**Endpoint:** `POST /api/v1/circles`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Family Circle",
  "description": "Family savings and expenses"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Family Circle",
  "description": "Family savings and expenses",
  "creator_id": 1
}
```

### List Circles

**Endpoint:** `GET /api/v1/circles`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
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
      }
    ]
  }
]
```

### Add Member to Circle

**Endpoint:** `POST /api/v1/circles/:id/members`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "user_id": 2,
  "role": "member"
}
```

**Response:**
```json
{
  "message": "Member added successfully",
  "circle_id": 1,
  "user_id": 2,
  "role": "member"
}
```

## Project Structure

```
dhukuti/
├── cmd/
│   └── api/
│       └── main.go           # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go         # Configuration management
│   ├── database/
│   │   └── database.go       # Database connection and migrations
│   ├── handlers/
│   │   ├── auth.go           # Authentication handlers
│   │   └── circle.go         # Circle handlers
│   ├── middleware/
│   │   └── auth.go           # JWT authentication middleware
│   └── models/
│       ├── user.go           # User model
│       └── circle.go         # Circle and CircleMember models
├── scripts/
│   └── seed.go               # Database seed script
├── migrations/               # Database migrations (auto-migration via GORM)
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker image definition
├── Makefile                  # Common development tasks
├── .env.example              # Example environment variables
└── README.md                 # This file
```

## Development

### Available Make Commands

```bash
make help          # Display help
make build         # Build the application
make run           # Run the application
make test          # Run tests
make clean         # Clean build artifacts
make docker-up     # Start Docker containers
make docker-down   # Stop Docker containers
make docker-build  # Build and start all containers
make seed          # Run database seed
make dev           # Start development environment
```

### Running Tests

```bash
make test
```

Or:

```bash
go test -v ./...
```

### Building

```bash
make build
```

The binary will be created in `bin/dhukuti`

## Configuration

Configuration is managed through environment variables. See `.env.example` for all available options:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8080 |
| GIN_MODE | Gin mode (debug/release) | debug |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USER | PostgreSQL user | dhukuti |
| DB_PASSWORD | PostgreSQL password | dhukuti_password |
| DB_NAME | PostgreSQL database name | dhukuti_db |
| DB_SSLMODE | PostgreSQL SSL mode | disable |
| JWT_SECRET | JWT signing secret | your-secret-key-change-this |
| JWT_EXPIRY_HOURS | JWT token expiry in hours | 24 |
| APP_ENV | Application environment | development |

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique user email
- `password` - Bcrypt hashed password
- `name` - User's name
- `created_at`, `updated_at`, `deleted_at` - Timestamps

### Circles Table
- `id` - Primary key
- `name` - Circle name
- `description` - Circle description
- `creator_id` - Foreign key to users
- `created_at`, `updated_at`, `deleted_at` - Timestamps

### Circle Members Table
- `id` - Primary key
- `circle_id` - Foreign key to circles
- `user_id` - Foreign key to users
- `role` - User role in circle (admin/member)
- `created_at`, `deleted_at` - Timestamps

## CI/CD

GitHub Actions workflow is configured to:
- Run tests on pull requests
- Build the application
- Run linting checks

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes require valid JWT token
- CORS can be configured in production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.
