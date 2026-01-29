package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.Government;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.repository.GovernmentRepository;
import com.trustchain.backend.service.CommunityNeedService;
import com.trustchain.backend.service.GovernmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/government")
public class GovernmentController {

    @Autowired
    private GovernmentService governmentService;

    @Autowired
    private GovernmentRepository governmentRepository;

    @Autowired
    private CommunityNeedService communityNeedService;

    @GetMapping("/dashboard")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        String userId = authentication.getName();
        Government government = governmentRepository.findByUserId(userId).orElse(null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Government Dashboard");
        response.put("userId", userId);
        response.put("role", "GOVERNMENT");
        
        if (government != null) {
            response.put("govtName", government.getGovtName());
            response.put("govtType", government.getType());
        }
        
        response.put("stats", Map.of(
                "totalSchemes", 0,
                "fundsAllocated", 0,
                "pendingReviews", 0));
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

    @PostMapping("/community-needs/{needId}/implement")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<?> implementCommunityNeed(@PathVariable UUID needId, Authentication authentication) {
        String userId = authentication.getName();
        Government government = governmentRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Government g = new Government();
                    g.setUserId(userId);
                    g.setGovtName("Government " + (userId.length() > 5 ? userId.substring(0, 5) : userId));
                    return governmentRepository.save(g);
                });
        Scheme scheme = communityNeedService.implementNeed(needId, government, userId);
        return ResponseEntity.ok(scheme);
    }

    @GetMapping("/reports")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<Map<String, Object>> getReports(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", authentication.getName());
        response.put("reports", new Object[] {});
        return ResponseEntity.ok(response);
    }

    // CRUD Endpoints
    @GetMapping
    public ResponseEntity<List<Government>> getAllGovernments() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Government> getGovernmentById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Government> createGovernment(@RequestBody Government government) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Government> updateGovernment(@PathVariable UUID id, @RequestBody Government government) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGovernment(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
