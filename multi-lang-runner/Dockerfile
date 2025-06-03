FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

# Install base utilities and JVM tools
RUN apt-get update && \
    apt-get install -y curl gnupg2 ca-certificates software-properties-common unzip && \
    apt-get install -y \
        openjdk-17-jdk \
        scala \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Kotlin compiler
ENV KOTLIN_VERSION=1.9.22
RUN curl -sSL -o kotlin-compiler.zip https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip && \
    unzip kotlin-compiler.zip -d /opt && \
    ln -s /opt/kotlinc/bin/* /usr/local/bin/ && \
    rm kotlin-compiler.zip

# Download JUnit Platform Console Standalone
ENV JUNIT_VERSION=1.12.2
RUN mkdir -p /usr/share/java && \
    curl -sSL -o /usr/share/java/junit-platform-console-standalone.jar \
    https://repo1.maven.org/maven2/org/junit/platform/junit-platform-console-standalone/${JUNIT_VERSION}/junit-platform-console-standalone-${JUNIT_VERSION}.jar

# Set the working directory
WORKDIR /code
RUN chmod 777 /code

# Default command
CMD ["bash"]
