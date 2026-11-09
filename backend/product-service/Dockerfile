FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src src
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp package -DskipTests
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S shopai && adduser -S shopai -G shopai
WORKDIR /app
COPY --from=build /build/target/product-service-0.1.0.jar app.jar
USER shopai
EXPOSE 8081
HEALTHCHECK --interval=20s --timeout=5s --start-period=60s CMD wget -q -O /dev/null http://localhost:8081/actuator/health/readiness || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
