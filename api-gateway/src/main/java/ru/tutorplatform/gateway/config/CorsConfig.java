package ru.tutorplatform.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Разрешённые источники (откуда могут приходить запросы)
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",      // Vite dev server
                "http://localhost:3000",
                "http://127.0.0.1:5173"
        ));

        // Разрешённые методы
        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Разрешённые headers
        corsConfig.setAllowedHeaders(Arrays.asList("*"));

        // Разрешить отправку cookies
        corsConfig.setAllowCredentials(true);

        // Время кэширования предварительного запроса (в секундах)
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
