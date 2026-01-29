package com.trustchain.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ClerkInvitationService {

    private static final Logger log = LoggerFactory.getLogger(ClerkInvitationService.class);
    private final RestTemplate restTemplate;
    private final String clerkSecretKey;

    public ClerkInvitationService(
            RestTemplate restTemplate,
            @Value("${clerk.secret.key:}") String clerkSecretKey) {
        this.restTemplate = restTemplate;
        this.clerkSecretKey = clerkSecretKey != null ? clerkSecretKey.trim() : "";
    }

    /**
     * Send an invitation to a user via Clerk
     * 
     * @param email       The email address to invite
     * @param redirectUrl Optional redirect URL after accepting invitation
     * @return The invitation ID if successful, null otherwise
     */
    public String sendInvitation(String email, String redirectUrl) {
        if (clerkSecretKey == null || clerkSecretKey.isBlank()) {
            log.error("❌ Clerk secret key not configured");
            return null;
        }

        if (email == null || email.isBlank()) {
            log.error("❌ Email is required to send invitation");
            return null;
        }

        try {
            String url = "https://api.clerk.com/v1/invitations";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + clerkSecretKey);

            Map<String, Object> body = new HashMap<>();
            body.put("email_address", email);

            if (redirectUrl != null && !redirectUrl.isBlank()) {
                body.put("redirect_url", redirectUrl);
            }

            // Optional: Set public metadata for the role
            // This will be available when the user accepts the invitation
            // Map<String, Object> publicMetadata = new HashMap<>();
            // publicMetadata.put("pending_role", role);
            // body.put("public_metadata", publicMetadata);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class);

            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("id")) {
                    String invitationId = (String) responseBody.get("id");
                    log.info("✅ Invitation sent successfully to {} (ID: {})", email, invitationId);
                    return invitationId;
                }
            }

            log.warn("⚠️ Unexpected response when sending invitation to {}: {}", email, response.getStatusCode());
            return null;

        } catch (Exception e) {
            log.error("❌ Error sending invitation to {}: {}", email, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Revoke an invitation
     * 
     * @param invitationId The ID of the invitation to revoke
     * @return true if successful, false otherwise
     */
    public boolean revokeInvitation(String invitationId) {
        if (clerkSecretKey == null || clerkSecretKey.isBlank()) {
            log.error("❌ Clerk secret key not configured");
            return false;
        }

        if (invitationId == null || invitationId.isBlank()) {
            log.error("❌ Invitation ID is required");
            return false;
        }

        try {
            String url = "https://api.clerk.com/v1/invitations/" + invitationId + "/revoke";

            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + clerkSecretKey);

            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("✅ Invitation {} revoked successfully", invitationId);
                return true;
            }

            log.warn("⚠️ Unexpected response when revoking invitation {}: {}", invitationId, response.getStatusCode());
            return false;

        } catch (Exception e) {
            log.error("❌ Error revoking invitation {}: {}", invitationId, e.getMessage(), e);
            return false;
        }
    }
}
