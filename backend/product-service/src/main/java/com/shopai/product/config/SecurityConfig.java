package com.shopai.product.config;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain security(HttpSecurity http) throws Exception {
        // Phase 1 is read-only: all state-changing endpoints are denied.
        return http.cors(c -> {}).csrf(c -> c.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.GET, "/api/v1/products", "/api/v1/products/*", "/api/v1/categories", "/actuator/health", "/actuator/health/**").permitAll()
                .anyRequest().denyAll()).build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${shopai.cors-origins}") List<String> origins) {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "X-Request-ID"));
        config.setExposedHeaders(List.of("X-Request-ID"));
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
