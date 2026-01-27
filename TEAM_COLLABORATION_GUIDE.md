# 🤝 TrustChain - Team Collaboration Guide

**Last Updated:** January 27, 2026  
**Purpose:** Enable parallel development with your team

---

## 🚀 Quick Start for Team Collaboration

### Step 1: Set Up Remote Repository (5 minutes)

#### Option A: GitHub (Recommended)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `TrustChain`
   - Description: "Blockchain-Based NGO Fund Transparency Platform"
   - Choose: Private (recommended) or Public
   - **DO NOT** initialize with README (you already have one)
   - Click "Create repository"

2. **Add remote and push:**
   ```bash
   cd /Users/mohitreddy/Documents/TrustChain
   
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/TrustChain.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

#### Option B: GitLab

```bash
# Create repo on GitLab, then:
git remote add origin https://gitlab.com/YOUR_USERNAME/TrustChain.git
git branch -M main
git push -u origin main
```

#### Option C: Bitbucket

```bash
# Create repo on Bitbucket, then:
git remote add origin https://bitbucket.org/YOUR_USERNAME/trustchain.git
git branch -M main
git push -u origin main
```

---

## 👥 Onboarding Teammates

### For Teammates to Clone the Project:

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/TrustChain.git
cd TrustChain

# 2. IMPORTANT: Get Firebase key from team lead
# The firebase-key.json is NOT in the repository (for security)
# Team lead should share it securely (see "Sharing Firebase Key" section below)

# 3. Place firebase-key.json in backend/
# File should be at: backend/firebase-key.json

# 4. Verify setup
ls backend/firebase-key.json  # Should show the file

# 5. Start the application
docker-compose up --build
```

---

## 🔐 Sharing Firebase Key Securely

**⚠️ NEVER commit firebase-key.json to Git!**

### Secure Sharing Methods:

#### Method 1: Encrypted File Sharing (Recommended)
```bash
# Team lead encrypts the file
gpg -c backend/firebase-key.json
# Creates: firebase-key.json.gpg

# Share firebase-key.json.gpg via email/Slack with password separately

# Teammates decrypt:
gpg firebase-key.json.gpg
mv firebase-key.json backend/
```

#### Method 2: Secure Cloud Storage
- Upload to Google Drive/Dropbox (private folder)
- Share link only with team members
- Each teammate downloads to `backend/firebase-key.json`

#### Method 3: Environment Variables (Production)
- Use secret management tools (AWS Secrets Manager, Google Secret Manager)
- Configure in CI/CD pipeline
- Not needed for local development

#### Method 4: Password Manager (1Password, LastPass)
- Store the JSON content as a secure note
- Share with team members
- They copy content to `backend/firebase-key.json`

---

## 🌿 Git Branching Strategy

### Recommended: GitHub Flow (Simple & Effective)

```
main (production-ready code)
  ├── feature/user-authentication
  ├── feature/ngo-management
  ├── feature/transaction-tracking
  ├── feature/frontend-dashboard
  └── bugfix/firebase-connection
```

### Branch Naming Convention:

```bash
# Features
feature/user-authentication
feature/ngo-crud-api
feature/dashboard-ui

# Bug fixes
bugfix/firebase-initialization
bugfix/cors-error

# Hotfixes
hotfix/security-patch

# Experiments
experiment/blockchain-integration
```

### Workflow:

```bash
# 1. Create a new branch for your feature
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "Add user authentication endpoint"

# 3. Push to remote
git push origin feature/your-feature-name

# 4. Create Pull Request on GitHub/GitLab
# 5. Team reviews and merges
```

---

## 👨‍💻 Task Division Strategy

### Recommended Parallel Work Division:

#### **Developer 1: Backend - Authentication**
```
Tasks:
- Implement user registration endpoint
- Create login endpoint
- JWT token generation
- Firebase authentication integration
- Password validation

Files to work on:
- backend/src/main/java/com/trustchain/backend/controller/AuthController.java
- backend/src/main/java/com/trustchain/backend/service/AuthService.java
- backend/src/main/java/com/trustchain/backend/dto/AuthRequest.java
- backend/src/main/java/com/trustchain/backend/dto/AuthResponse.java

Branch: feature/user-authentication
```

#### **Developer 2: Backend - NGO Management**
```
Tasks:
- Create NGO entity model
- Implement NGO CRUD operations
- NGO repository and service
- NGO REST endpoints

Files to work on:
- backend/src/main/java/com/trustchain/backend/model/NGO.java
- backend/src/main/java/com/trustchain/backend/repository/NGORepository.java
- backend/src/main/java/com/trustchain/backend/service/NGOService.java
- backend/src/main/java/com/trustchain/backend/controller/NGOController.java

Branch: feature/ngo-management
```

#### **Developer 3: Backend - Transaction System**
```
Tasks:
- Create Transaction entity
- Implement transaction recording
- Transaction history API
- Blockchain integration preparation

Files to work on:
- backend/src/main/java/com/trustchain/backend/model/Transaction.java
- backend/src/main/java/com/trustchain/backend/repository/TransactionRepository.java
- backend/src/main/java/com/trustchain/backend/service/TransactionService.java
- backend/src/main/java/com/trustchain/backend/controller/TransactionController.java

Branch: feature/transaction-system
```

#### **Developer 4: Frontend - Authentication UI**
```
Tasks:
- Login page
- Registration page
- Protected routes
- Authentication context
- Token management

Files to work on:
- frontend/src/components/Auth/Login.js
- frontend/src/components/Auth/Register.js
- frontend/src/components/Auth/ProtectedRoute.js
- frontend/src/context/AuthContext.js
- frontend/src/services/authService.js

Branch: feature/auth-ui
```

#### **Developer 5: Frontend - Dashboard**
```
Tasks:
- Main dashboard layout
- NGO listing component
- Transaction viewer
- Dashboard navigation

Files to work on:
- frontend/src/components/Dashboard/Dashboard.js
- frontend/src/components/NGO/NGOList.js
- frontend/src/components/Transaction/TransactionList.js
- frontend/src/components/Layout/Navigation.js

Branch: feature/dashboard-ui
```

#### **Developer 6: Database & DevOps**
```
Tasks:
- Set up PostgreSQL/MySQL
- Create database schema
- Configure JPA entities
- Update docker-compose.yml
- CI/CD pipeline setup

Files to work on:
- docker-compose.yml
- backend/src/main/resources/application.properties
- backend/pom.xml (add JPA dependencies)
- .github/workflows/ci.yml (if using GitHub Actions)

Branch: feature/database-setup
```

---

## 📋 Daily Workflow

### Morning Standup (15 minutes)
```
Each team member shares:
1. What I did yesterday
2. What I'm doing today
3. Any blockers
```

### Development Workflow:

```bash
# Start of day
git checkout main
git pull origin main
git checkout -b feature/my-task

# During development
git add .
git commit -m "Descriptive commit message"
git push origin feature/my-task

# End of day
git push origin feature/my-task
# Create/update Pull Request
```

### Pull Request Process:

1. **Create PR** with clear description
2. **Request review** from at least 1 teammate
3. **Address feedback**
4. **Merge** after approval
5. **Delete branch** after merge

---

## 🔄 Avoiding Merge Conflicts

### Best Practices:

1. **Pull frequently:**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-branch
   git merge main  # Keep your branch updated
   ```

2. **Small, focused commits:**
   - Commit often
   - Each commit should have a single purpose

3. **Communicate:**
   - Announce when working on shared files
   - Use Slack/Discord for coordination

4. **File ownership:**
   - Each developer owns specific files
   - Coordinate before editing shared files

---

## 🛠️ Development Environment Setup

### Each Teammate Needs:

```bash
# 1. Install prerequisites
- Docker & Docker Compose
- Git
- Java 17 (for backend development)
- Node.js 18+ (for frontend development)
- IDE (IntelliJ IDEA / VS Code)

# 2. Clone and setup
git clone https://github.com/YOUR_USERNAME/TrustChain.git
cd TrustChain

# 3. Get firebase-key.json from team lead
# Place in: backend/firebase-key.json

# 4. Start development
docker-compose up --build
```

### IDE Configuration:

#### IntelliJ IDEA (Backend):
```
1. Open backend/ folder
2. Import as Maven project
3. Set JDK to Java 17
4. Enable annotation processing
5. Install Spring Boot plugin
```

#### VS Code (Frontend):
```
1. Open frontend/ folder
2. Install extensions:
   - ESLint
   - Prettier
   - ES7+ React/Redux/React-Native snippets
3. Configure Prettier for formatting
```

---

## 📞 Communication Channels

### Recommended Tools:

1. **Slack/Discord** - Daily communication
   - Channels: #general, #backend, #frontend, #devops

2. **GitHub Issues** - Task tracking
   - Label issues: `bug`, `enhancement`, `documentation`
   - Assign to team members

3. **GitHub Projects** - Kanban board
   - Columns: To Do, In Progress, Review, Done

4. **Weekly Meetings** - Video calls
   - Sprint planning
   - Code reviews
   - Architecture discussions

---

## 🔍 Code Review Guidelines

### For Authors:

- Write clear PR descriptions
- Keep PRs small (< 400 lines)
- Add tests for new features
- Update documentation

### For Reviewers:

- Review within 24 hours
- Be constructive and kind
- Test the code locally
- Check for security issues

### PR Template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

---

## 🚦 CI/CD Setup (Optional but Recommended)

### GitHub Actions Example:

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build with Maven
        run: cd backend && ./mvnw clean package

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Build
        run: cd frontend && npm run build
```

---

## 📊 Project Management

### Sprint Planning (2-week sprints):

**Week 1-2: Authentication & Database**
- User registration/login
- Database setup
- Basic frontend auth

**Week 3-4: NGO Management**
- NGO CRUD operations
- NGO listing UI
- NGO details page

**Week 5-6: Transaction System**
- Transaction recording
- Transaction history
- Transaction UI

**Week 7-8: Blockchain Integration**
- Smart contracts
- Blockchain connection
- Verification system

---

## 🆘 Common Issues & Solutions

### Issue: "firebase-key.json not found"
**Solution:** Get the file from team lead, place in `backend/`

### Issue: Merge conflicts
**Solution:**
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
# Resolve conflicts in IDE
git add .
git commit -m "Resolve merge conflicts"
```

### Issue: Docker port conflicts
**Solution:**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### Issue: Different Docker versions
**Solution:** Ensure all team members use same Docker version

---

## ✅ Team Onboarding Checklist

For each new team member:

- [ ] GitHub/GitLab account added to repository
- [ ] Received firebase-key.json securely
- [ ] Installed Docker & Docker Compose
- [ ] Installed Java 17 & Node.js 18+
- [ ] Cloned repository successfully
- [ ] Placed firebase-key.json in backend/
- [ ] Successfully ran `docker-compose up --build`
- [ ] Accessed frontend at localhost:3000
- [ ] Accessed backend at localhost:8080
- [ ] Assigned first task
- [ ] Added to communication channels (Slack/Discord)
- [ ] Read project documentation

---

## 🎯 Summary

**To work in parallel with teammates:**

1. ✅ Push code to GitHub/GitLab
2. ✅ Share firebase-key.json securely
3. ✅ Divide tasks by feature/component
4. ✅ Use feature branches
5. ✅ Create Pull Requests for review
6. ✅ Communicate regularly
7. ✅ Pull main branch frequently
8. ✅ Follow code review process

**Your team can now work efficiently in parallel!** 🚀

---

**Need Help?** Refer to this guide or ask in your team channel!
