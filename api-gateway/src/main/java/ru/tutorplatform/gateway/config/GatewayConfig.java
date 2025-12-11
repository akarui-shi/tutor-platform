package ru.tutorplatform.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .uri("lb://USER-SERVICE"))

                .route("auth-service", r -> r
                        .path("/api/auth/**")
//                        .uri("http://localhost:8081"))
                        .uri("lb://USER-SERVICE"))

                .route("lesson-service", r -> r
                        .path("/api/lessons/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://LESSON-SERVICE"))

                .route("payment-service", r -> r
                        .path("/api/payments/**")
                        .uri("lb://PAYMENT-SERVICE"))

                .route("calendar-service", r -> r
                        .path("/api/calendar/**")
                        .uri("lb://CALENDAR-SERVICE"))

                .route("swagger", r -> r
                        .path("/v3/api-docs/**")
                        .uri("http://localhost:8080"))
                .build();
    }
}