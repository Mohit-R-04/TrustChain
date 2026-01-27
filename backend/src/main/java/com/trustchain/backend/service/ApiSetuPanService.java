package com.trustchain.backend.service;

import com.trustchain.backend.config.ApiSetuConfig;
import com.trustchain.backend.dto.PanVerificationRequest;
import com.trustchain.backend.dto.PanVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiSetuPanService {

    private final WebClient webClient;
    private final ApiSetuConfig apiSetuConfig;

    /**
     * Verify PAN using API Setu
     * Note: This is a mock implementation for testing purposes
     * In production, you would call the actual API Setu endpoint
     */
    public PanVerificationResponse verifyPan(PanVerificationRequest request) {
        log.info("Verifying PAN: {}", maskPan(request.getPanNumber()));

        try {
            // For testing purposes, we'll simulate the API call
            // In production, uncomment the actual API call below

            /*
             * Map<String, Object> requestBody = new HashMap<>();
             * requestBody.put("panNumber", request.getPanNumber());
             * requestBody.put("consent", "Y");
             * 
             * Map<String, Object> response = webClient.post()
             * .uri("/api/v1/pan-verification")
             * .header("x-client-id", apiSetuConfig.getXClientId())
             * .header("x-client-secret", apiSetuConfig.getXClientSecret())
             * .bodyValue(requestBody)
             * .retrieve()
             * .bodyToMono(Map.class)
             * .block();
             */

            // Mock response for testing
            return createMockResponse(request.getPanNumber());

        } catch (Exception e) {
            log.error("Error verifying PAN: {}", e.getMessage(), e);
            return PanVerificationResponse.builder()
                    .success(false)
                    .message("Verification failed: " + e.getMessage())
                    .panNumber(maskPan(request.getPanNumber()))
                    .status("FAILED")
                    .build();
        }
    }

    /**
     * Create mock response for testing
     * This simulates successful PAN verification
     */
    private PanVerificationResponse createMockResponse(String panNumber) {
        // Determine category based on 4th character of PAN
        String category = determinePanCategory(panNumber);

        return PanVerificationResponse.builder()
                .success(true)
                .message("PAN verified successfully")
                .panNumber(maskPan(panNumber))
                .name("Test PAN Holder")
                .dateOfBirth("01/01/1990")
                .fatherName("Test Father Name")
                .category(category)
                .status("VERIFIED")
                .referenceId("PANREF" + System.currentTimeMillis())
                .build();
    }

    private String determinePanCategory(String pan) {
        if (pan == null || pan.length() < 4) {
            return "Unknown";
        }

        char fourthChar = pan.charAt(3);
        return switch (fourthChar) {
            case 'P' -> "Individual";
            case 'C' -> "Company";
            case 'H' -> "HUF (Hindu Undivided Family)";
            case 'F' -> "Firm";
            case 'A' -> "Association of Persons";
            case 'T' -> "Trust";
            case 'B' -> "Body of Individuals";
            case 'L' -> "Local Authority";
            case 'J' -> "Artificial Juridical Person";
            case 'G' -> "Government";
            default -> "Other";
        };
    }

    private String maskPan(String pan) {
        if (pan == null || pan.length() != 10) {
            return pan;
        }
        return "XXXXX" + pan.substring(5, 9) + "X";
    }
}
