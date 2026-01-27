package com.trustchain.backend.controller;

import com.trustchain.backend.dto.RoleAssignmentRequest;
import com.trustchain.backend.dto.RoleAssignmentResponse;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.security.JwtTokenValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtTokenValidator jwtTokenValidator;

    /**
     * Assign role to user during first login
     * Validates that user doesn't already have a role
     */
    @PostMapping("/assign-role")
    public ResponseEntity<?> assignRole(
            @RequestBody RoleAssignmentRequest request,
            HttpServletRequest httpRequest) {

        try {
            // Extract token from Authorization header
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Missing or invalid authorization token"));
            }

            String token = authHeader.substring(7);

            // Validate token
            if (!jwtTokenValidator.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid token"));
            }

            // Get user ID from token
            String userId = jwtTokenValidator.getUserIdFromToken(token);

            // Check if user already has a role
            String existingRole = jwtTokenValidator.getRoleFromToken(token);

            if (existingRole != null && !existingRole.equals("citizen")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", "User already has a role assigned",
                                "existingRole", existingRole,
                                "message", "A user cannot have multiple roles. You are already registered as "
                                        + existingRole.toUpperCase()));
            }

            // Validate requested role
            String requestedRole = request.getRole();
            if (requestedRole == null || requestedRole.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Role is required"));
            }

            // Verify role is valid
            try {
                UserRole.valueOf(requestedRole.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid role: " + requestedRole));
            }

            // In a real application, you would:
            // 1. Update the role in your database
            // 2. Update Clerk user metadata via Clerk API
            // For now, we'll return success and let Clerk handle it client-side

            RoleAssignmentResponse response = new RoleAssignmentResponse();
            response.setSuccess(true);
            response.setUserId(userId);
            response.setAssignedRole(requestedRole);
            response.setMessage("Role assigned successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to assign role: " + e.getMessage()));
        }
    }

    /**
     * Validate user's role matches the requested role
     */
    @PostMapping("/validate-role")
    public ResponseEntity<?> validateRole(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Missing authorization token"));
            }

            String token = authHeader.substring(7);

            if (!jwtTokenValidator.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid token"));
            }

            String userRole = jwtTokenValidator.getRoleFromToken(token);
            String requestedRole = request.get("role");

            if (!userRole.equalsIgnoreCase(requestedRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "error", "Role mismatch",
                                "userRole", userRole,
                                "requestedRole", requestedRole,
                                "message", "You are registered as " + userRole.toUpperCase()
                                        + ". Please select the correct role tab."));
            }

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "role", userRole));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Validation failed: " + e.getMessage()));
        }
    }

    /**
     * Get current user's role
     */
    @GetMapping("/my-role")
    public ResponseEntity<?> getMyRole(HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Missing authorization token"));
            }

            String token = authHeader.substring(7);

            if (!jwtTokenValidator.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid token"));
            }

            String userId = jwtTokenValidator.getUserIdFromToken(token);
            String userRole = jwtTokenValidator.getRoleFromToken(token);
            String email = jwtTokenValidator.getEmailFromToken(token);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("role", userRole);
            response.put("email", email);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get role: " + e.getMessage()));
        }
    }
}
