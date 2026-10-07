FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd --system styleme && useradd --system --gid styleme styleme
COPY --from=build /workspace/target/styleme-backend-1.0.0-SNAPSHOT.jar /app/styleme-backend.jar
USER styleme
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/styleme-backend.jar"]
