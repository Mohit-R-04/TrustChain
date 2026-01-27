package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auditor")
public class AuditorController {

    @GetMapping("/dashboard")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Auditor Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "AUDITOR");
        response.put("stats", Map.of(
                "pendingAudits", 0,
                "completedAudits", 0,
                "flaggedTransactions", 0));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/audits")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, String>> startAudit(
            @RequestBody Map<String, Object> auditData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Audit started successfully");
        response.put("auditorId", authentication.getName());
        response.put("status", "in_progress");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/flag")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, String>> flagTransaction(
            @RequestBody Map<String, Object> flagData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Transaction flagged successfully");
        response.put("auditorId", authentication.getName());
        response.put("status", "flagged");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, Object>> getAuditReports(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", authentication.getName());
        response.put("reports", new Object[] {});
        return ResponseEntity.ok(response);
    }
}
