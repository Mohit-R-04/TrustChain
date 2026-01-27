package com.trustchain.backend.service;

import com.trustchain.backend.config.ApiSetuConfig;
import com.trustchain.backend.dto.AadhaarVerificationRequest;
import com.trustchain.backend.dto.AadhaarVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiSetuService {

    private final WebClient webClient;
    private final ApiSetuConfig apiSetuConfig;

    /**
     * Verify Aadhaar using API Setu
     * Note: This is a mock implementation for testing purposes
     * In production, you would call the actual API Setu endpoint
     */
    public AadhaarVerificationResponse verifyAadhaar(AadhaarVerificationRequest request) {
        log.info("Verifying Aadhaar: {}", maskAadhaar(request.getAadhaarNumber()));

        try {
            // For testing purposes, we'll simulate the API call
            // In production, uncomment the actual API call below

            /*
             * Map<String, Object> requestBody = new HashMap<>();
             * requestBody.put("aadhaarNumber", request.getAadhaarNumber());
             * requestBody.put("consent", "Y");
             * 
             * Map<String, Object> response = webClient.post()
             * .uri("/api/v1/aadhaar-verification")
             * .header("x-client-id", apiSetuConfig.getXClientId())
             * .header("x-client-secret", apiSetuConfig.getXClientSecret())
             * .bodyValue(requestBody)
             * .retrieve()
             * .bodyToMono(Map.class)
             * .block();
             */

            // Mock response for testing
            return createMockResponse(request.getAadhaarNumber());

        } catch (Exception e) {
            log.error("Error verifying Aadhaar: {}", e.getMessage(), e);
            return AadhaarVerificationResponse.builder()
                    .success(false)
                    .message("Verification failed: " + e.getMessage())
                    .aadhaarNumber(maskAadhaar(request.getAadhaarNumber()))
                    .status("FAILED")
                    .build();
        }
    }

    /**
     * Create mock response for testing
     * This simulates successful Aadhaar verification
     */
    private AadhaarVerificationResponse createMockResponse(String aadhaarNumber) {
        return AadhaarVerificationResponse.builder()
                .success(true)
                .message("Aadhaar verified successfully")
                .aadhaarNumber(maskAadhaar(aadhaarNumber))
                .name("Test User")
                .dateOfBirth("01/01/1990")
                .gender("M")
                .address("123 Test Street, Test City, Test State - 123456")
                .status("VERIFIED")
                .referenceId("REF" + System.currentTimeMillis())
                .build();
    }

    private String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() != 12) {
            return aadhaar;
        }
        return "XXXX-XXXX-" + aadhaar.substring(8);
    }
}
