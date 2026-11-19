package com.whitequantex.company.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:7001,http://127.0.0.1:7001,http://localhost:7000,http://127.0.0.1:7000}")
    private String allowedOriginsConfig;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public exploratory endpoints
                .requestMatchers(HttpMethod.GET, "/api/companies", "/api/companies/{id}", "/api/companies/check-name", "/api/companies/check-ticker/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/companies/{tickerOrId}/financials").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/companies/{id}/documents").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/companies/{id}/lifecycle/history").permitAll()
                .requestMatchers("/api/auth/**", "/actuator/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // Protected corporate operations require authentication
                .requestMatchers(HttpMethod.POST, "/api/companies", "/api/companies/ventures").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/companies/{id}").authenticated()
                .requestMatchers("/api/companies/{id}/members/**").authenticated()
                .requestMatchers("/api/companies/{id}/transfer-ownership").authenticated()
                .requestMatchers("/api/companies/{id}/verification/**").authenticated()
                .requestMatchers("/api/companies/{id}/documents/**").authenticated()
                .requestMatchers("/api/companies/{id}/lifecycle/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/companies/{tickerOrId}/financials").authenticated()
                .requestMatchers("/api/companies/{id}/audit-logs/**").authenticated()
                .requestMatchers("/api/companies/my-companies").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = new ArrayList<>();
        if (allowedOriginsConfig != null && !allowedOriginsConfig.isBlank()) {
            for (String o : allowedOriginsConfig.split(",")) {
                String trimmed = o.trim();
                if (!trimmed.isEmpty()) {
                    origins.add(trimmed);
                }
            }
        }
        if (origins.isEmpty()) {
            origins = Arrays.asList("http://localhost:7001", "http://127.0.0.1:7001", "http://localhost:7000", "http://127.0.0.1:7000");
        }

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-WQ-User-Id", "X-Idempotency-Key", "X-Requested-With", "Origin", "Cookie"));
        config.setExposedHeaders(List.of("Set-Cookie", "Authorization", "X-Idempotency-Key"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
