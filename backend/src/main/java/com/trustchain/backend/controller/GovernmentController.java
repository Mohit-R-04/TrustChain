package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/government")
public class GovernmentController {

    @GetMapping("/dashboard")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Government Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "GOVERNMENT");
        response.put("stats", Map.of(
            "totalSchemes", 0,
            "fundsAllocated", 0,
            "pendingReviews", 0
        ));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/schemes")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<Map<String, String>> createScheme(
            @RequestBody Map<String, Object> schemeData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Scheme created successfully");
        response.put("createdBy", authentication.getName());
        response.put("status", "active");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<Map<String, Object>> getReports(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", authentication.getName());
        response.put("reports", new Object[]{});
        return ResponseEntity.ok(response);
    }
}
