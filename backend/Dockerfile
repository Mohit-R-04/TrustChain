# -------- BUILD STAGE --------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn ./.mvn
COPY mvnw pom.xml ./
# Fix line endings and make executable
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# -------- RUN STAGE --------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built JAR from Maven target directory
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
