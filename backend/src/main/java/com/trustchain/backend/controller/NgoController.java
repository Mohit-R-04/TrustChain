package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ngo")
public class NGOController {

    @GetMapping("/dashboard")
    @RequireRole(UserRole.NGO)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to NGO Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "NGO");
        response.put("stats", Map.of(
                "activeProjects", 0,
                "fundsReceived", 0,
                "beneficiaries", 0));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/projects")
    @RequireRole(UserRole.NGO)
    public ResponseEntity<Map<String, String>> createProject(
            @RequestBody Map<String, Object> projectData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Project created successfully");
        response.put("ngoId", authentication.getName());
        response.put("status", "pending_approval");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/documents")
    @RequireRole(UserRole.NGO)
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestBody Map<String, Object> documentData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Document uploaded to IPFS successfully");
        response.put("ngoId", authentication.getName());
        response.put("ipfsHash", "Qm...");
        return ResponseEntity.ok(response);
    }
}
