package com.trustchain.backend.config;

import com.trustchain.backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // CORS configuration
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Disable CSRF for stateless API
                                .csrf(csrf -> csrf.disable())

                                // Stateless session management
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Authorization rules
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints - no authentication required
                                                .requestMatchers("/api/public/**").permitAll()
                                                .requestMatchers("/api/hello").permitAll()
                                                .requestMatchers("/api/health").permitAll()
                                                .requestMatchers("/api/otp/**").permitAll()

                                                // Auth endpoints - require authentication but no specific role
                                                .requestMatchers("/api/auth/**").authenticated()

                                                // Citizen endpoints - accessible to all authenticated users
                                                .requestMatchers(HttpMethod.GET, "/api/citizen/**").permitAll()

                                                // Role-specific endpoints
                                                .requestMatchers("/api/donor/**").hasRole("DONOR")
                                                .requestMatchers("/api/government/**").hasRole("GOVERNMENT")
                                                .requestMatchers("/api/ngo/**").hasRole("NGO")
                                                .requestMatchers("/api/vendor/**").hasRole("VENDOR")
                                                .requestMatchers("/api/auditor/**").hasRole("AUDITOR")

                                                // Admin endpoints (if needed)
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // All other requests require authentication
                                                .anyRequest().authenticated())

                                // Add JWT filter before UsernamePasswordAuthenticationFilter
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                                // Exception handling
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(401);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\": \"Unauthorized\", \"message\": \""
                                                                                        +
                                                                                        authException.getMessage()
                                                                                        + "\"}");
                                                })
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        response.setStatus(403);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\": \"Forbidden\", \"message\": \"" +
                                                                                        accessDeniedException
                                                                                                        .getMessage()
                                                                                        + "\"}");
                                                }));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allow frontend origins (both local and Docker)
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:80",
                                "http://frontend:3000"));

                // Allow all HTTP methods
                configuration.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                // Allow all headers
                configuration.setAllowedHeaders(List.of("*"));

                // Allow credentials (cookies, authorization headers)
                configuration.setAllowCredentials(true);

                // Expose headers that frontend can read
                configuration.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "X-Total-Count"));

                // Cache preflight response for 1 hour
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
