package com.trustchain.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;

@Service
public class ClerkEnforcementService {

    private static final Logger log = LoggerFactory.getLogger(ClerkEnforcementService.class);

    private final WebClient webClient;
    private final String clerkSecretKey;

    public ClerkEnforcementService(
            WebClient.Builder webClientBuilder,
            @Value("${clerk.secret.key:}") String clerkSecretKey) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.clerk.com")
                .build();
        this.clerkSecretKey = clerkSecretKey != null ? clerkSecretKey.trim() : "";
    }

    public void enforceForSessionCreated(JsonNode eventData) {
        if (eventData == null) {
            log.warn("⚠️ Session created event data is null");
            return;
        }

        String sessionId = text(eventData, "id");
        String userId = firstNonBlank(
                text(eventData, "user_id"),
                text(eventData, "userId"));

        log.info("🔐 Enforcing 2FA for session: {} (user: {})", sessionId, userId);

        // Check if 2FA (TOTP or SMS OTP) was used at sign-in
        boolean twoFactorVerifiedAtSignIn = wasSmsOtpUsedAtSignIn(eventData);
        log.info("🔑 2FA verified at sign-in for session {}: {}", sessionId, twoFactorVerifiedAtSignIn);

        // Revoke session if 2FA was not used
        if (!twoFactorVerifiedAtSignIn) {
            log.warn("❌ REVOKING session {} - 2FA was not verified at sign-in", sessionId);
            revokeSession(sessionId);
        } else {
            log.info("✅ Session {} allowed - 2FA requirement met", sessionId);
        }
    }

    private boolean userHasVerifiedPhone(String userId) {
        if (isBlank(clerkSecretKey) || isBlank(userId)) {
            log.warn("⚠️ Cannot check phone verification - missing secret key or user ID");
            return false;
        }
        try {
            JsonNode user = webClient.get()
                    .uri("/v1/users/{userId}", userId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + clerkSecretKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (user == null) {
                log.warn("⚠️ User {} not found in Clerk", userId);
                return false;
            }

            JsonNode phones = user.get("phone_numbers");
            if (phones == null || !phones.isArray() || phones.size() == 0) {
                log.warn("⚠️ User {} has no phone numbers", userId);
                return false;
            }

            for (JsonNode p : phones) {
                JsonNode ver = p.get("verification");
                String status = ver != null ? text(ver, "status") : null;
                if ("verified".equalsIgnoreCase(status)) {
                    String phoneNumber = text(p, "phone_number");
                    log.info("✅ User {} has verified phone: {}", userId, phoneNumber);
                    return true;
                }
            }

            log.warn("⚠️ User {} has phone numbers but none are verified", userId);
            return false;
        } catch (WebClientResponseException e) {
            log.error("❌ Clerk API error checking phone for user {}: {} - {}",
                    userId, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("❌ Error checking phone verification for user {}: {}", userId, e.getMessage());
            return false;
        }
    }

    private void revokeSession(String sessionId) {
        if (isBlank(clerkSecretKey) || isBlank(sessionId)) {
            log.warn("⚠️ Cannot revoke session - missing secret key or session ID");
            return;
        }
        try {
            webClient.post()
                    .uri("/v1/sessions/{sessionId}/revoke", sessionId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + clerkSecretKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue("{}")
                    .retrieve()
                    .toBodilessEntity()
                    .timeout(Duration.ofSeconds(10))
                    .block();
            log.info("🚫 Successfully revoked session: {}", sessionId);
        } catch (WebClientResponseException e) {
            log.error("❌ Clerk API error revoking session {}: {} - {}",
                    sessionId, e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("❌ Error revoking session {}: {}", sessionId, e.getMessage());
        }
    }

    /**
     * Checks if SMS OTP (phone_code or sms_code) was verified during this sign-in.
     * Looks for factor_verification_age in multiple possible locations in the JWT
     * claims.
     * If the second factor age is 0 minutes, it means OTP was just verified.
     */
    private boolean wasSmsOtpUsedAtSignIn(JsonNode eventData) {
        // Try to extract factor verification age from various possible paths
        Integer secondFactorAge = extractSecondFactorAgeMinutes(eventData);

        if (secondFactorAge == null) {
            log.warn("⚠️ Could not extract second factor age from session data");
            return false;
        }

        log.info("📊 Second factor age: {} minutes", secondFactorAge);

        // Age of 0 means the factor was just verified (at sign-in)
        // Age > 0 means the factor was verified in the past (not at this sign-in)
        return secondFactorAge == 0;
    }

    private Integer extractSecondFactorAgeMinutes(JsonNode eventData) {
        // Try multiple possible paths where factor_verification_age might be located
        JsonNode fva = firstPresent(eventData,
                // Direct field
                List.of("factor_verification_age"),
                List.of("factorVerificationAge"),
                // In last_active_token.jwt.claims.fva
                List.of("last_active_token", "jwt", "claims", "fva"),
                // In lastActiveToken.jwt.claims.fva (camelCase)
                List.of("lastActiveToken", "jwt", "claims", "fva"),
                // In last_active_token.claims.fva
                List.of("last_active_token", "claims", "fva"),
                // In lastActiveToken.claims.fva
                List.of("lastActiveToken", "claims", "fva"),
                // In last_active_token.raw.claims.fva
                List.of("last_active_token", "raw", "claims", "fva"));

        if (fva == null) {
            log.debug("🔍 factor_verification_age not found in any known path");
            return null;
        }

        // fva is an array: [factor_type, age_in_minutes]
        // Example: ["phone_code", 0] or ["sms_code", 0]
        if (!fva.isArray() || fva.size() < 2) {
            log.warn("⚠️ factor_verification_age found but not in expected format: {}", fva);
            return null;
        }

        JsonNode factorType = fva.get(0);
        JsonNode ageNode = fva.get(1);

        if (factorType == null || ageNode == null || !ageNode.isNumber()) {
            log.warn("⚠️ Invalid factor_verification_age structure");
            return null;
        }

        String factor = factorType.asText();
        int age = ageNode.asInt();

        log.info("📋 Factor verification: type={}, age={} minutes", factor, age);

        // Accept SMS-based (phone_code, sms_code), TOTP-based (totp), or Email-based
        // (email_code) factors
        if (!"phone_code".equals(factor) && !"sms_code".equals(factor) && !"totp".equals(factor)
                && !"email_code".equals(factor)) {
            log.warn("⚠️ Factor type '{}' is not a valid 2FA method", factor);
            return null;
        }

        return age;
    }

    private static JsonNode firstPresent(JsonNode root, List<String>... paths) {
        for (List<String> path : paths) {
            JsonNode cur = root;
            boolean ok = true;
            for (String key : path) {
                if (cur == null) {
                    ok = false;
                    break;
                }
                cur = cur.get(key);
            }
            if (ok && cur != null && !cur.isMissingNode()) {
                return cur;
            }
        }
        return null;
    }

    private static String text(JsonNode node, String key) {
        if (node == null || key == null)
            return null;
        JsonNode v = node.get(key);
        if (v == null || v.isNull())
            return null;
        String s = v.asText();
        return s != null ? s.trim() : null;
    }

    private static String firstNonBlank(String... values) {
        if (values == null)
            return null;
        for (String v : values) {
            if (!isBlank(v))
                return v.trim();
        }
        return null;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
