.PHONY: help build run test clean docker-up docker-down seed migrate

help: ## Display this help screen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the application
	@echo "Building application..."
	@go build -o bin/dhukuti ./cmd/api

run: ## Run the application
	@echo "Running application..."
	@go run ./cmd/api/main.go

test: ## Run tests
	@echo "Running tests..."
	@go test -v ./...

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf bin/
	@go clean

docker-up: ## Start Docker containers
	@echo "Starting Docker containers..."
	@docker compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5

docker-down: ## Stop Docker containers
	@echo "Stopping Docker containers..."
	@docker compose down

docker-build: ## Build and start all Docker containers
	@echo "Building and starting all Docker containers..."
	@docker compose up --build -d

seed: ## Run database seed
	@echo "Running database seed..."
	@go run ./scripts/seed.go

migrate: ## Run database migrations (automatically done on startup)
	@echo "Migrations are automatically run on application startup"

dev: docker-up ## Start development environment
	@echo "Development environment ready!"
	@echo "Database: postgres://dhukuti:dhukuti_password@localhost:5432/dhukuti_db"
	@sleep 2
	@make run

.DEFAULT_GOAL := help
