package com.trustchain.backend.controller;

import com.trustchain.backend.service.ClerkInvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ClerkInvitationService clerkInvitationService;

    /**
     * Send an invitation to a user
     * Request body: { "email": "user@example.com", "redirectUrl":
     * "https://yourapp.com/signup" }
     */
    @PostMapping("/invite")
    public ResponseEntity<?> inviteUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String redirectUrl = request.get("redirectUrl");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required"));
        }

        String invitationId = clerkInvitationService.sendInvitation(email, redirectUrl);

        if (invitationId != null) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "invitationId", invitationId,
                    "message", "Invitation sent successfully to " + email));
        } else {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "success", false,
                            "error", "Failed to send invitation"));
        }
    }

    /**
     * Revoke an invitation
     * Request body: { "invitationId": "inv_xxxxx" }
     */
    @PostMapping("/revoke-invitation")
    public ResponseEntity<?> revokeInvitation(@RequestBody Map<String, String> request) {
        String invitationId = request.get("invitationId");

        if (invitationId == null || invitationId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invitation ID is required"));
        }

        boolean success = clerkInvitationService.revokeInvitation(invitationId);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Invitation revoked successfully"));
        } else {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "success", false,
                            "error", "Failed to revoke invitation"));
        }
    }
}
