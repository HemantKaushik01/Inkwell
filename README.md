# Inkwell Development Branch

This is the development branch for the Inkwell platform. All feature development happens here before being merged to `main`.

## Overview

The `dev` branch serves as the integration point for all ongoing development work. Code is tested and reviewed here before deployment to production via the `main` branch.

## Branch Guidelines

### Creating Feature Branches

1. Always create feature branches from `dev`
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

2. Push to your feature branch
```bash
git push origin feature/your-feature-name
```

3. Create a Pull Request to `dev` for review

### Pull Request Process

1. Title: `[SERVICE] Brief description`
   - Example: `[POST-SERVICE] Add draft post functionality`

2. Description should include:
   - What changes were made
   - Why the changes were made
   - How to test the changes
   - Any breaking changes

3. Require at least 2 approvals before merging

4. All CI/CD checks must pass

## Development Workflow

```
feature branch → dev (testing) → main (production)
```

## Services Structure

Each service has its own branch for isolated development:

### Backend Services
- `analytics-service` - Analytics and insights
- `api-gateway` - Central API gateway
- `auth-service` - Authentication and authorization
- `category-tag-service` - Content categorization
- `comment-service` - Comment management
- `eureka-server` - Service discovery
- `media-service` - Media management
- `newsletter-service` - Newsletter management
- `notification-service` - Notifications
- `post-service` - Post management

### Frontend
- `frontend` - React web application

## Development Setup

### Prerequisites
- Java 11+
- Node.js 14+
- Docker & Docker Compose
- PostgreSQL
- Redis
- Maven
- npm/yarn

### Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/HemantKaushik01/Inkwell.git
cd Inkwell

# Start services with Docker Compose
git checkout dev
docker-compose up
```

### Manual Setup

1. Start PostgreSQL
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

2. Start Redis
```bash
docker run -d -p 6379:6379 redis
```

3. Start Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
```

4. Start other services (in separate terminals)
```bash
cd auth-service
mvn spring-boot:run
```

5. Start frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

### Unit Tests
```bash
# For a specific service
cd post-service
mvn test
```

### Integration Tests
```bash
cd post-service
mvn verify
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Code Quality

### Java Services
```bash
# SonarQube analysis
mvn clean verify sonar:sonar

# Checkstyle
mvn checkstyle:check

# SpotBugs
mvn spotbugs:check
```

### Frontend
```bash
# ESLint
npm run lint

# Format code
npm run format
```

## API Testing

Use Postman or Insomnia to test APIs:
- API Gateway: `http://localhost:8080`
- Auth Service: `http://localhost:8082`
- Post Service: `http://localhost:8083`

## Debugging

### Backend Services
```bash
# Enable debug mode
export MAVEN_OPTS="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
mvn spring-boot:run
```

### Frontend
```bash
# Open browser devtools (F12)
# Use React DevTools and Redux DevTools extensions
```

## Commit Conventions

Use conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Build/dependency changes

Example:
```
feat(post-service): add draft post functionality

Users can now save posts as drafts and continue editing later.
Draft posts are not visible to other users.

Closes #123
```

## Deployment to Production

1. Code review and approval on `dev`
2. Create release branch from `dev`
3. Update version numbers
4. Merge to `main` via Pull Request
5. Tag release: `v1.2.3`
6. GitHub Actions deploys to production

## CI/CD Pipeline

Automated checks on every pull request:
- Unit tests
- Integration tests
- Code quality analysis
- Security scanning
- Build verification

## Documentation

- API documentation in service READMEs
- Database schema diagrams
- Architecture documentation
- Deployment guides

## Resources

- [Main Repository](https://github.com/HemantKaushik01/Inkwell)
- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Support

For development questions:
- Open an issue with `[DEV]` prefix
- Check existing issues
- Contact team members

## Next Steps

After setting up development environment:
1. Pick an issue from the project board
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit pull request
6. Address review feedback
7. Merge to `dev`

Happy coding! 🚀
