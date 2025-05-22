FROM eclipse-temurin:17-jre
WORKDIR /codemaster-solution-service
COPY /build/libs/*.jar codemaster-solution-service.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "codemaster-solution-service.jar"]