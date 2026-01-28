# TrustChain - Blockchain-Based NGO Fund Transparency Platform

A full-stack application for transparent NGO fund management using blockchain technology, built with Spring Boot and React.

## 🏗️ Architecturee

- **Backend:** Spring Boot 3.2.1 (Java 17)
- **Frontend:** React 19.2.4
- **Containerization:** Docker & Docker Compose
- **Build Tools:** Maven (Backend), npm (Frontend)

## 📋 Prerequisites

- Docker & Docker Compose
- Java 17 (for local development)
- Node.js 18+ (for local development)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Mohit-R-04/TrustChain.git
cd TrustChain

# 2. Build and start all services
docker compose up --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Local Development

#### Backend:
```bash
cd backend
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
│   │       │       │   └── SecurityConfig.java
│   │       │       └── controller/
│   │       │           └── HelloController.java
│   │       └── resources/
│   ├── pom.xml
│   └── Dockerfile
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
REACT_APP_API_URL=http://localhost:8080
```

## 📦 Key Dependencies

### Backend:
- Spring Boot Web
- Spring Boot Security
- Spring Boot Validation
- Spring DevTools

### Frontend:
- React 19.2.4
- React Scripts 5.0.1
- Testing Library

## 🛠️ Development Workflows

### Stop all services:
```bash
docker compose down
```

### View logs:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Rebuild after changes:
```bash
docker compose up --build
```

## 📚 API Documentation

### Current Endpoints:

- `GET /api/hello` - Test endpoint
  - Response: `"Spring Boot is working!"`

*More endpoints will be added as development progresses.*

## 🔒 Security Notes

- CORS is configured for localhost:3000
- CSRF disabled for development (enable for production)
- Implement proper authentication before deployment
- Use HTTPS in production
- Validate all user inputs

## 🎯 Next Development Steps

1. ✅ Project structure setup
2. ✅ Docker configuration
3. ✅ Basic security configuration
4. ⏳ Implement user authentication
5. ⏳ Design and implement database schema
6. ⏳ Create NGO management APIs
7. ⏳ Build frontend components
8. ⏳ Integrate blockchain for transaction transparency

## 🤝 Contributing

This is a blockchain-based transparency platform for NGO fund management. Contributions are welcome!

## 📄 License

[Add your license here]

## 📞 Support

For issues or questions, please refer to the project documentation or create an issue.

---

**Status:** ✅ Ready for development  
**Last Updated:** January 27, 2026
