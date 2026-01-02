# Contributing to Dhukuti

Thank you for your interest in contributing to Dhukuti! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/dhukuti.git`
3. Add upstream remote: `git remote add upstream https://github.com/Sudan23/dhukuti.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Go 1.22 or higher
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Setup Steps

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Start the database:
   ```bash
   make docker-up
   ```

3. Run the application:
   ```bash
   make run
   ```

4. Run tests:
   ```bash
   make test
   ```

## Code Standards

### Go Code Style

- Follow standard Go conventions
- Run `gofmt` before committing: `gofmt -s -w .`
- Run `go vet` to catch common errors: `go vet ./...`
- Write clear, descriptive variable and function names
- Add comments for exported functions and types

### Testing

- Write unit tests for new features
- Maintain or improve test coverage
- Test files should be named `*_test.go`
- Use table-driven tests when appropriate

Example:
```go
func TestSomething(t *testing.T) {
    tests := []struct {
        name     string
        input    string
        expected string
    }{
        {"case1", "input1", "output1"},
        {"case2", "input2", "output2"},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := DoSomething(tt.input)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

### Commit Messages

Follow conventional commit format:

- `feat: Add new feature`
- `fix: Fix bug in authentication`
- `docs: Update README`
- `test: Add tests for circle handler`
- `refactor: Restructure database package`
- `chore: Update dependencies`

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the API.md documentation if you change endpoints
3. Add tests for new features
4. Ensure all tests pass: `make test`
5. Ensure code is formatted: `gofmt -s -w .`
6. Create a pull request with a clear description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe the tests you ran

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## Project Structure

```
dhukuti/
├── cmd/
│   └── api/              # Application entry point
├── internal/
│   ├── config/           # Configuration management
│   ├── database/         # Database connection and migrations
│   ├── handlers/         # HTTP handlers
│   ├── middleware/       # HTTP middleware
│   └── models/           # Data models
├── scripts/              # Utility scripts (seed, etc.)
├── migrations/           # Database migrations
└── docs/                 # Documentation
```

## Adding New Features

### Adding a New Model

1. Create model file in `internal/models/`
2. Add model to `database.Migrate()` in `internal/database/database.go`
3. Add tests for the model
4. Update migrations documentation

### Adding a New Endpoint

1. Create or update handler in `internal/handlers/`
2. Register route in `cmd/api/main.go`
3. Add tests for the handler
4. Update API.md documentation
5. Update Postman collection

### Adding Middleware

1. Create middleware in `internal/middleware/`
2. Apply middleware to routes in `cmd/api/main.go`
3. Add tests for middleware
4. Document middleware behavior

## Security

- Never commit sensitive data (passwords, keys, tokens)
- Use environment variables for configuration
- Hash passwords using bcrypt
- Validate all user input
- Use parameterized queries (GORM handles this)
- Keep dependencies up to date

## Questions?

If you have questions, please:
1. Check existing issues
2. Review documentation
3. Open a new issue with your question

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
