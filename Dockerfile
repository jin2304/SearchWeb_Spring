FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew clean bootJar

FROM eclipse-temurin:17-jre-alpine
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]