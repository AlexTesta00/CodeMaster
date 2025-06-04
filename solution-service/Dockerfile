FROM eclipse-temurin:21.0.7_6-jdk AS builder
WORKDIR /codemaster-solution-service
COPY gradlew .
COPY gradle gradle
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build --no-daemon --stacktrace -x test

FROM eclipse-temurin:21.0.7_6-jre
WORKDIR /codemaster-solution-service

# Install dependencies for Docker CLI
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /codemaster-solution-service/build/libs/codemaster-solution-service.jar codemaster-solution-service.jar

EXPOSE 3000
ENTRYPOINT ["java", "-jar", "codemaster-solution-service.jar"]
