# 🚀 Quick Setup for Teammates

## For Team Lead (You)

### 1. Push to GitHub (2 minutes)
```bash
# Create repo on GitHub: https://github.com/new
# Then run:

cd /Users/mohitreddy/Documents/TrustChain
git remote add origin https://github.com/YOUR_USERNAME/TrustChain.git
git push -u origin main
```

### 2. Share Firebase Key Securely
**Option A: Encrypted**
```bash
gpg -c backend/firebase-key.json
# Share firebase-key.json.gpg + password separately
```

**Option B: Google Drive**
- Upload `backend/firebase-key.json` to private folder
- Share link with team only

### 3. Invite Teammates
- Add collaborators on GitHub: Settings → Collaborators
- Share repository URL
- Share firebase-key.json securely

---

## For Teammates

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/TrustChain.git
cd TrustChain
```

### 2. Get Firebase Key
- Ask team lead for `firebase-key.json`
- Place in: `backend/firebase-key.json`

### 3. Start Development
```bash
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

### 4. Create Your Feature Branch
```bash
git checkout -b feature/your-task-name
# Make changes
git add .
git commit -m "Your message"
git push origin feature/your-task-name
# Create Pull Request on GitHub
```

---

## 📋 Task Assignment Template

Copy this to your team chat:

```
🎯 TrustChain - Sprint 1 Tasks

Developer 1: @name
- Branch: feature/user-authentication
- Tasks: User registration, login endpoints, JWT tokens

Developer 2: @name
- Branch: feature/ngo-management
- Tasks: NGO CRUD API, NGO entity model

Developer 3: @name
- Branch: feature/transaction-system
- Tasks: Transaction recording, history API

Developer 4: @name
- Branch: feature/auth-ui
- Tasks: Login/Register pages, protected routes

Developer 5: @name
- Branch: feature/dashboard-ui
- Tasks: Dashboard layout, NGO listing UI

Developer 6: @name
- Branch: feature/database-setup
- Tasks: PostgreSQL setup, JPA configuration
```

---

## 🔄 Daily Workflow

```bash
# Morning
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main

# Work on your feature
# ... make changes ...

# Commit frequently
git add .
git commit -m "Descriptive message"

# End of day
git push origin feature/your-branch
```

---

## 🆘 Quick Troubleshooting

**Problem:** firebase-key.json not found  
**Solution:** Get from team lead, place in `backend/`

**Problem:** Port already in use  
**Solution:** `lsof -ti:3000 | xargs kill -9`

**Problem:** Merge conflict  
**Solution:** 
```bash
git merge main
# Fix conflicts in IDE
git add .
git commit -m "Resolve conflicts"
```

---

## 📞 Communication

- **Daily:** Slack/Discord
- **Code:** Pull Requests on GitHub
- **Tasks:** GitHub Issues
- **Meetings:** Weekly video call

---

**Full Guide:** See `TEAM_COLLABORATION_GUIDE.md`
