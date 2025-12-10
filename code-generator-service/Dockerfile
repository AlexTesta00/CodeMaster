FROM eclipse-temurin:21.0.9_10-jdk AS builder
WORKDIR /codemaster-generator-service

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts ./
COPY . .

RUN chmod +x ./gradlew
RUN ./gradlew clean build --no-daemon --stacktrace -x test

FROM eclipse-temurin:21.0.9_10-jre
WORKDIR /codemaster-generator-service

COPY --from=builder /codemaster-generator-service/build/libs/codemaster-generator-service.jar codemaster-generator-service.jar

EXPOSE 4008

ENTRYPOINT ["java", "-jar", "codemaster-generator-service.jar"]

