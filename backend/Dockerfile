# ── STAGE 1: BUILD ───────────────────────────────────────────────
# Use Maven + Java 17 image to build the app
# This stage compiles your code and creates a JAR file
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory inside container
WORKDIR /app

# Copy pom.xml first — Docker caches this layer
# So if only your code changes, Maven doesn't re-download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# ── STAGE 2: RUN ─────────────────────────────────────────────────
# Use lightweight Java 17 runtime — no Maven needed here
# This keeps the final image small (~200MB vs ~600MB)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy only the JAR from build stage — not the entire Maven project
COPY --from=build /app/target/*.jar app.jar

# Tell Docker this container listens on port 8080
EXPOSE 8080

# Command to run when container starts
ENTRYPOINT ["java", "-jar", "app.jar"]