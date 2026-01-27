---
description: Build the Java project using Maven
---

# Build the TrustChain Backend

This workflow builds the Spring Boot backend using Maven.

## Steps

1. Navigate to the backend directory:
```bash
cd /Users/mohitreddy/Documents/TrustChain/backend
```

// turbo
2. Clean and compile the project:
```bash
./mvnw clean compile
```

// turbo
3. Run tests (optional):
```bash
./mvnw test
```

// turbo
4. Package the application:
```bash
./mvnw package
```

// turbo
5. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

## Notes

- The backend will start on port 8080 by default
- Make sure Java 17 is installed and configured
- Firebase configuration requires FIREBASE_CONFIG_PATH environment variable to be set
