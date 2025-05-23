FROM eclipse-temurin:21.0.7_6-jre
WORKDIR /codemaster-solution-service
COPY build/libs/*.jar codemaster-solution-service.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "codemaster-solution-service.jar"]