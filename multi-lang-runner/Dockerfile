FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

# Install base utilities and Node.js from NodeSource
RUN apt-get update && \
    apt-get install -y curl gnupg2 ca-certificates software-properties-common && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y \
        openjdk-17-jdk \
        scala \
        nodejs \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /home/runner

CMD ["bash"]
