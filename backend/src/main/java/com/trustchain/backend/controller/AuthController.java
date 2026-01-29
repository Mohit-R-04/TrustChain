package com.trustchain.backend.controller;

import com.trustchain.backend.dto.RoleAssignmentRequest;
import com.trustchain.backend.dto.RoleAssignmentResponse;
import com.trustchain.backend.model.Auditor;
import com.trustchain.backend.model.Donor;
import com.trustchain.backend.model.Government;
import com.trustchain.backend.model.Ngo;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.model.Vendor;
import com.trustchain.backend.repository.AuditorRepository;
import com.trustchain.backend.repository.DonorRepository;
import com.trustchain.backend.repository.GovernmentRepository;
import com.trustchain.backend.repository.NgoRepository;
import com.trustchain.backend.repository.VendorRepository;
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

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private GovernmentRepository governmentRepository;

    @Autowired
    private NgoRepository ngoRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private AuditorRepository auditorRepository;

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

            // Get user ID and email from token
            String userId = jwtTokenValidator.getUserIdFromToken(token);

            // NOTE: We don't check JWT token role here because the DATABASE is the source
            // of truth
            // If database is flushed, user should be able to re-register even if JWT still
            // has old role

            // Validate requested role
            String requestedRole = request.getRole();
            if (requestedRole == null || requestedRole.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Role is required"));
            }

            // Verify role is valid
            UserRole userRoleEnum;
            try {
                userRoleEnum = UserRole.valueOf(requestedRole.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid role: " + requestedRole));
            }

            String emailFromToken = jwtTokenValidator.getEmailFromToken(token);
            String emailFromRequest = request.getEmail();
            String email = (emailFromToken != null && !emailFromToken.isEmpty())
                    ? emailFromToken
                    : emailFromRequest;

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            // Phone number is optional (TOTP can be used instead of SMS)
            String phoneNumber = request.getPhoneNumber();
            if (phoneNumber != null) {
                phoneNumber = phoneNumber.trim().isEmpty() ? null : phoneNumber.trim();
            }

            // Check if email already exists in ANY role table
            String existingRoleForEmail = null;

            if (donorRepository.findByEmail(email).isPresent()) {
                existingRoleForEmail = "donor";
            } else if (governmentRepository.findByEmail(email).isPresent()) {
                existingRoleForEmail = "government";
            } else if (ngoRepository.findByEmail(email).isPresent()) {
                existingRoleForEmail = "ngo";
            } else if (vendorRepository.findByEmail(email).isPresent()) {
                existingRoleForEmail = "vendor";
            } else if (auditorRepository.findByEmail(email).isPresent()) {
                existingRoleForEmail = "auditor";
            }

            // If email exists with a different role, reject the request
            if (existingRoleForEmail != null && !existingRoleForEmail.equalsIgnoreCase(requestedRole)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error", "Email already registered with a different role",
                                "existingRole", existingRoleForEmail,
                                "attemptedRole", requestedRole,
                                "message", "This email is already registered as " + existingRoleForEmail.toUpperCase()
                                        + ". Each email can only have one role. Please use a different email address."));
            }

            // If email exists with the same role, just return success (idempotent)
            if (existingRoleForEmail != null && existingRoleForEmail.equalsIgnoreCase(requestedRole)) {
                RoleAssignmentResponse response = new RoleAssignmentResponse();
                response.setSuccess(true);
                response.setUserId(userId);
                response.setAssignedRole(requestedRole);
                response.setMessage("Role already assigned");
                return ResponseEntity.ok(response);
            }

            String providedName = request.getName();
            String effectiveName = (providedName != null && !providedName.trim().isEmpty())
                    ? providedName.trim()
                    : deriveNameFromEmail(email);

            switch (userRoleEnum) {
                case DONOR: {
                    Donor donor = new Donor();
                    donor.setUserId(userId);
                    donor.setEmail(email);
                    donor.setName(effectiveName);
                    donor.setPhoneNumber(phoneNumber);
                    donorRepository.save(donor);
                    break;
                }
                case GOVERNMENT: {
                    Government government = new Government();
                    government.setUserId(userId);
                    government.setEmail(email);
                    government.setGovtName(effectiveName);
                    government.setPhoneNumber(phoneNumber);
                    
                    // Domain-based Government Type Assignment
                    if (email != null && email.toLowerCase().endsWith(".edu.in")) {
                        government.setType("CENTRAL");
                    } else if (email != null && email.toLowerCase().endsWith("@gmail.com")) {
                        government.setType("STATE");
                    } else {
                        // Default fallback (e.g., STATE or maybe REJECT)
                        government.setType("STATE"); 
                    }
                    
                    governmentRepository.save(government);
                    break;
                }
                case NGO: {
                    Ngo ngo = new Ngo();
                    ngo.setUserId(userId);
                    ngo.setEmail(email);
                    ngo.setName(effectiveName);
                    ngo.setPhoneNumber(phoneNumber);
                    ngoRepository.save(ngo);
                    break;
                }
                case VENDOR: {
                    Vendor vendor = new Vendor();
                    vendor.setUserId(userId);
                    vendor.setEmail(email);
                    vendor.setName(effectiveName);
                    vendor.setPhoneNumber(phoneNumber);
                    vendorRepository.save(vendor);
                    break;
                }
                case AUDITOR: {
                    Auditor auditor = new Auditor();
                    auditor.setUserId(userId);
                    auditor.setEmail(email);
                    auditor.setName(effectiveName);
                    auditor.setPhoneNumber(phoneNumber);
                    auditorRepository.save(auditor);
                    break;
                }
                default:
                    break;
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

    @PostMapping("/sync-phone")
    public ResponseEntity<?> syncPhone(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Missing or invalid authorization token"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenValidator.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid token"));
            }

            String userId = jwtTokenValidator.getUserIdFromToken(token);
            String email = jwtTokenValidator.getEmailFromToken(token);
            String phoneNumber = request.get("phoneNumber");

            // Phone number is optional (TOTP can be used instead of SMS)
            if (phoneNumber != null) {
                phoneNumber = phoneNumber.trim().isEmpty() ? null : phoneNumber.trim();
            }

            if (userId != null && !userId.isBlank()) {
                Donor donor = donorRepository.findByUserId(userId).orElse(null);
                if (donor != null) {
                    donor.setPhoneNumber(phoneNumber);
                    donorRepository.save(donor);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "donor"));
                }
                Government government = governmentRepository.findByUserId(userId).orElse(null);
                if (government != null) {
                    government.setPhoneNumber(phoneNumber);
                    governmentRepository.save(government);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "government"));
                }
                Ngo ngo = ngoRepository.findByUserId(userId).orElse(null);
                if (ngo != null) {
                    ngo.setPhoneNumber(phoneNumber);
                    ngoRepository.save(ngo);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "ngo"));
                }
                Vendor vendor = vendorRepository.findByUserId(userId).orElse(null);
                if (vendor != null) {
                    vendor.setPhoneNumber(phoneNumber);
                    vendorRepository.save(vendor);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "vendor"));
                }
                Auditor auditor = auditorRepository.findByUserId(userId).orElse(null);
                if (auditor != null) {
                    auditor.setPhoneNumber(phoneNumber);
                    auditorRepository.save(auditor);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "auditor"));
                }
            }

            if (email != null && !email.isBlank()) {
                Donor donor = donorRepository.findByEmail(email).orElse(null);
                if (donor != null) {
                    donor.setPhoneNumber(phoneNumber);
                    donorRepository.save(donor);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "donor"));
                }
                Government government = governmentRepository.findByEmail(email).orElse(null);
                if (government != null) {
                    government.setPhoneNumber(phoneNumber);
                    governmentRepository.save(government);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "government"));
                }
                Ngo ngo = ngoRepository.findByEmail(email).orElse(null);
                if (ngo != null) {
                    ngo.setPhoneNumber(phoneNumber);
                    ngoRepository.save(ngo);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "ngo"));
                }
                Vendor vendor = vendorRepository.findByEmail(email).orElse(null);
                if (vendor != null) {
                    vendor.setPhoneNumber(phoneNumber);
                    vendorRepository.save(vendor);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "vendor"));
                }
                Auditor auditor = auditorRepository.findByEmail(email).orElse(null);
                if (auditor != null) {
                    auditor.setPhoneNumber(phoneNumber);
                    auditorRepository.save(auditor);
                    return ResponseEntity.ok(Map.of("updated", true, "role", "auditor"));
                }
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User role record not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to sync phone: " + e.getMessage()));
        }
    }

    @GetMapping("/user-role")
    public ResponseEntity<?> getUserRole(HttpServletRequest httpRequest) {
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

            // Get user ID and email from token
            String userId = jwtTokenValidator.getUserIdFromToken(token);
            String email = jwtTokenValidator.getEmailFromToken(token);

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email not found in token"));
            }

            // Check all role tables to find user's role
            String userRole = null;

            if (donorRepository.findByEmail(email).isPresent()) {
                userRole = "donor";
            } else if (governmentRepository.findByEmail(email).isPresent()) {
                userRole = "government";
            } else if (ngoRepository.findByEmail(email).isPresent()) {
                userRole = "ngo";
            } else if (vendorRepository.findByEmail(email).isPresent()) {
                userRole = "vendor";
            } else if (auditorRepository.findByEmail(email).isPresent()) {
                userRole = "auditor";
            }

            if (userRole != null) {
                return ResponseEntity.ok(Map.of(
                        "role", userRole,
                        "userId", userId,
                        "email", email));
            } else {
                return ResponseEntity.ok(Map.of(
                        "role", "citizen",
                        "userId", userId,
                        "email", email,
                        "message", "No role assigned yet"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get user role: " + e.getMessage()));
        }
    }

    private String deriveNameFromEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "User";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return email;
        }
        return email.substring(0, atIndex);
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
