# TrustChain - Blockchain-Based NGO Fund Transparency Platform

A full-stack application for transparent NGO fund management using blockchain technology, built with Spring Boot and React.

## 🏗️ Architecture

- **Backend:** Spring Boot 3.2.1 (Java 17) with Firebase Authentication
- **Frontend:** React 19.2.4
- **Containerization:** Docker & Docker Compose
- **Authentication:** Firebase Admin SDK
- **Build Tools:** Maven (Backend), npm (Frontend)

## 📋 Prerequisites

- Docker & Docker Compose
- Firebase Project with Service Account Key
- Java 17 (for local development)
- Node.js 18+ (for local development)

## 🔥 Firebase Setup (REQUIRED)

**This is the most critical step before running the application!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file and rename it to `firebase-key.json`
6. Place it in: `backend/firebase-key.json`
7. **Important:** Never commit this file to git (already in .gitignore)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# 1. Clone and navigate to the project
cd /Users/mohitreddy/Documents/TrustChain

# 2. Ensure Firebase key is in place
ls backend/firebase-key.json

# 3. Build and start all services
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Local Development

#### Backend:
```bash
cd backend
export FIREBASE_CONFIG_PATH=./firebase-key.json
./mvnw spring-boot:run
```

#### Frontend:
```bash
cd frontend
npm install
npm start
```

## 🧪 Testing the Setup

### Test Backend API:
```bash
curl http://localhost:8080/api/hello
# Expected: "Spring Boot is working!"
```

### Test Frontend:
Open browser at `http://localhost:3000` - you should see the React app connecting to the backend.

## 📁 Project Structure

```
TrustChain/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/trustchain/backend/
│   │       │       ├── TrustchainApplication.java
│   │       │       ├── config/
│   │       │       │   └── FirebaseConfig.java
│   │       │       └── controller/
│   │       │           └── HelloController.java
│   │       └── resources/
│   ├── pom.xml
│   ├── Dockerfile
│   └── firebase-key.json       # ⚠️ YOU NEED TO ADD THIS
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ...
│   ├── package.json
│   ├── .env
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Frontend (`.env`):**
```env
REACT_APP_API_URL=http://backend:8080
```

**Backend (docker-compose.yml):**
```yaml
FIREBASE_CONFIG_PATH=/app/firebase-key.json
```

## 📦 Key Dependencies

### Backend:
- Spring Boot Web
- Spring Boot Security
- Spring Boot Validation
- Firebase Admin SDK 9.2.0
- Spring DevTools

### Frontend:
- React 19.2.4
- React Scripts 5.0.1
- Testing Library

## 🛠️ Development Workflows

### Build the project:
```bash
# Using the custom workflow
# (Assumes Maven is configured)
```

### Stop all services:
```bash
docker-compose down
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild after changes:
```bash
docker-compose up --build
```

## 📚 API Documentation

### Current Endpoints:

- `GET /api/hello` - Test endpoint
  - Response: `"Spring Boot is working!"`

*More endpoints will be added as development progresses.*

## 🔒 Security Notes

- Firebase service account key is sensitive - never commit to git
- CORS configuration needed for production
- Implement proper authentication before deployment
- Use HTTPS in production
- Validate all user inputs

## 🎯 Next Development Steps

1. ✅ Project structure setup
2. ✅ Docker configuration
3. ✅ Firebase integration setup
4. ⏳ Implement user authentication
5. ⏳ Design and implement database schema
6. ⏳ Create NGO management APIs
7. ⏳ Build frontend components
8. ⏳ Integrate blockchain for transaction transparency

## 📖 Additional Documentation

See `PROJECT_BLUEPRINT_CHECKLIST.md` for a comprehensive setup checklist and development roadmap.

## 🤝 Contributing

This is a blockchain-based transparency platform for NGO fund management. Contributions are welcome!

## 📄 License

[Add your license here]

## 📞 Support

For issues or questions, please refer to the project documentation or create an issue.

---

**Status:** ✅ Ready for development (pending Firebase key setup)  
**Last Updated:** January 27, 2026
