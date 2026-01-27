package com.trustchain.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@ConfigurationProperties(prefix = "apisetu")
@Data
public class ApiSetuConfig {

    // Default URL to avoid null pointer if not set in properties
    private String baseUrl = "https://apisetu.gov.in";
    private String clientId;
    private String clientSecret;
    private String xClientId;
    private String xClientSecret;

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl(baseUrl != null ? baseUrl : "https://apisetu.gov.in")
                .build();
    }
}
