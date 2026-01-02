# Database Migrations

This application uses GORM's AutoMigrate feature for database migrations. Migrations are automatically executed when the application starts.

## How it works

The migrations are defined in `/internal/database/database.go` in the `Migrate()` function. When the application starts, it automatically:

1. Connects to the database
2. Runs AutoMigrate for all models
3. Creates/updates tables as needed

## Models

The following models are automatically migrated:

### Users
- Primary key: `id` (auto-increment)
- Fields: `email` (unique), `password`, `name`
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft delete)

### Circles
- Primary key: `id` (auto-increment)
- Fields: `name`, `description`, `creator_id` (foreign key to users)
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft delete)

### Circle Members
- Primary key: `id` (auto-increment)
- Fields: `circle_id` (foreign key), `user_id` (foreign key), `role`
- Timestamps: `created_at`, `deleted_at` (soft delete)
- Indexes: `circle_id`, `user_id`

## Manual Migration

If you need to run migrations manually without starting the server:

```go
package main

import (
    "github.com/Sudan23/dhukuti/internal/config"
    "github.com/Sudan23/dhukuti/internal/database"
)

func main() {
    cfg, _ := config.Load()
    database.Connect(cfg)
    database.Migrate()
}
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Circles table
CREATE TABLE circles (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INTEGER NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE INDEX idx_circles_deleted_at ON circles(deleted_at);

-- Circle Members table
CREATE TABLE circle_members (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    deleted_at TIMESTAMP,
    circle_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    FOREIGN KEY (circle_id) REFERENCES circles(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX idx_circle_members_deleted_at ON circle_members(deleted_at);
```

## Seeding Data

To populate the database with sample data, run:

```bash
make seed
```

Or:

```bash
go run ./scripts/seed.go
```

This will create:
- 3 sample users (alice@example.com, bob@example.com, charlie@example.com)
- 2 sample circles
- Circle memberships

All sample users have the password: `password123`

## Reset Database

To reset the database and start fresh:

```bash
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d postgres

# Run the application (migrations will run automatically)
go run ./cmd/api/main.go

# Seed data (optional)
go run ./scripts/seed.go
```
