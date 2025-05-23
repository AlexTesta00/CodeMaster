FROM eclipse-temurin:17.0.15_6-jdk AS builder
WORKDIR /app
COPY . .
RUN ./gradlew clean build --no-daemon

FROM eclipse-temurin:17.0.15_6-jre
WORKDIR /codemaster-solution-service
COPY --from=builder /app/build/libs/*.jar codemaster-solution-service.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "codemaster-solution-service.jar"]
