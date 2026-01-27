# Contributing to TrustChain

Thank you for your interest in contributing to TrustChain! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Git
- Java 17 (for backend development)
- Node.js 18+ (for frontend development)

### Setup
1. Clone the repository
2. Get `firebase-key.json` from team lead
3. Place it in `backend/firebase-key.json`
4. Run `docker-compose up --build`

## 🌿 Branching Strategy

We use **GitHub Flow**:

- `main` - Production-ready code
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent fixes

### Branch Naming
```
feature/user-authentication
feature/ngo-management
bugfix/firebase-connection
hotfix/security-patch
```

## 📝 Commit Messages

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples:
```
feat(auth): add user registration endpoint

Implemented user registration with email validation
and password hashing using BCrypt.

Closes #123
```

```
fix(firebase): resolve initialization error

Fixed Firebase initialization by updating the
credentials path in docker-compose.yml

Fixes #456
```

## 🔄 Workflow

### 1. Create a Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Write tests for new features

### 3. Commit Changes
```bash
git add .
git commit -m "feat(scope): your message"
```

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

### 5. Code Review
- Address reviewer feedback
- Update your PR as needed
- Ensure CI passes

### 6. Merge
- Squash and merge (preferred)
- Delete branch after merge

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
docker-compose up --build
# Run integration tests
```

## 📋 Code Style

### Backend (Java)
- Follow Java naming conventions
- Use meaningful variable names
- Keep methods small and focused
- Add JavaDoc for public methods
- Use Spring Boot best practices

### Frontend (JavaScript/React)
- Use functional components
- Follow React Hooks best practices
- Use meaningful component names
- Add PropTypes or TypeScript
- Keep components small and reusable

### General
- Maximum line length: 120 characters
- Use 4 spaces for indentation (Java)
- Use 2 spaces for indentation (JavaScript)
- No trailing whitespace

## 🔍 Code Review Guidelines

### For Authors
- Keep PRs small (< 400 lines)
- Write clear PR descriptions
- Add tests for new features
- Update documentation
- Respond to feedback promptly

### For Reviewers
- Review within 24 hours
- Be constructive and respectful
- Test the code locally
- Check for security issues
- Approve or request changes clearly

## 🐛 Reporting Bugs

Use the bug report template:
1. Go to Issues → New Issue
2. Select "Bug Report"
3. Fill in all sections
4. Add appropriate labels

## ✨ Requesting Features

Use the feature request template:
1. Go to Issues → New Issue
2. Select "Feature Request"
3. Describe the feature clearly
4. Explain the motivation

## 📚 Documentation

- Update README.md for major changes
- Add inline comments for complex code
- Update API documentation
- Keep CHANGELOG.md updated

## 🔐 Security

- Never commit `firebase-key.json`
- Never commit API keys or secrets
- Use environment variables for sensitive data
- Report security issues privately to team lead

## 📞 Communication

- **Slack/Discord**: Daily communication
- **GitHub Issues**: Bug reports and features
- **Pull Requests**: Code discussions
- **Weekly Meetings**: Team sync

## ✅ Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
- [ ] PR description is clear
- [ ] Linked to related issue

## 🎯 Development Priorities

### Phase 1: Foundation
- User authentication
- Database setup
- Basic CRUD operations

### Phase 2: Core Features
- NGO management
- Transaction recording
- Dashboard UI

### Phase 3: Advanced Features
- Blockchain integration
- Reporting system
- Admin panel

## 🆘 Getting Help

- Check documentation first
- Search existing issues
- Ask in team chat
- Create a new issue if needed

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to TrustChain! 🎉
