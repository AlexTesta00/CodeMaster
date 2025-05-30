FROM eclipse-temurin:21.0.7_6-jdk AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build --no-daemon

FROM eclipse-temurin:21.0.7_6-jre
WORKDIR /codemaster-solution-service
COPY --from=builder /app/build/libs/*.jar codemaster-solution-service.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "codemaster-solution-service.jar"]
