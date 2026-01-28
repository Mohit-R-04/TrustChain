package com.trustchain.backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Base64;

@Component
public class JwtTokenValidator {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenValidator.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Validates the JWT token from Clerk (Skipping signature for compatibility)
     */
    public boolean validateToken(String token) {
        try {
            JsonNode payload = decodePayload(token);
            if (payload == null)
                return false;

            // Check expiration
            if (payload.has("exp")) {
                long exp = payload.get("exp").asLong();
                if (Instant.now().getEpochSecond() > exp) {
                    logger.warn("Token has expired");
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        try {
            JsonNode payload = decodePayload(token);
            return payload != null && payload.has("sub") ? payload.get("sub").asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            JsonNode payload = decodePayload(token);
            if (payload == null)
                return "citizen";

            // Check public_metadata.role
            if (payload.has("public_metadata")) {
                JsonNode metadata = payload.get("public_metadata");
                if (metadata.has("role")) {
                    return metadata.get("role").asText();
                }
            }

            // Fallback to direct role claim
            if (payload.has("role")) {
                return payload.get("role").asText();
            }

            return "citizen";
        } catch (Exception e) {
            return "citizen";
        }
    }

    public String getEmailFromToken(String token) {
        try {
            JsonNode payload = decodePayload(token);
            if (payload == null) {
                return null;
            }

            if (payload.has("email")) {
                return payload.get("email").asText();
            }

            if (payload.has("email_addresses") && payload.get("email_addresses").isArray()) {
                JsonNode emailAddresses = payload.get("email_addresses");
                if (emailAddresses.size() > 0) {
                    JsonNode first = emailAddresses.get(0);
                    if (first.has("email_address")) {
                        return first.get("email_address").asText();
                    }
                }
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private JsonNode decodePayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2)
                return null;
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readTree(decoded);
        } catch (Exception e) {
            logger.error("Error decoding token: {}", e.getMessage());
            return null;
        }
    }
}
