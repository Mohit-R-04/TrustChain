package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.Ngo;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.service.NgoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngo")
public class NGOController {

    @Autowired
    private NgoService ngoService;

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

    // CRUD Endpoints
    @GetMapping
    public ResponseEntity<List<Ngo>> getAllNgos() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ngo> getNgoById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Ngo> createNgo(@RequestBody Ngo ngo) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ngo> updateNgo(@PathVariable UUID id, @RequestBody Ngo ngo) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNgo(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
