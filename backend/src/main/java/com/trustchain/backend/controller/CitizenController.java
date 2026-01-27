package com.trustchain.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Public endpoints accessible to all users (citizens)
 */
@RestController
@RequestMapping("/api/citizen")
public class CitizenController {

    @GetMapping("/transparency")
    public ResponseEntity<Map<String, Object>> getTransparencyData() {
        Map<String, Object> response = new HashMap<>();
        response.put("fundsInEscrow", "₹23,000,000");
        response.put("activeSchemes", 156);
        response.put("verifiedNGOs", 428);
        response.put("ipfsDocuments", 12847);
        response.put("transparentPayments", 8934);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects")
    public ResponseEntity<Map<String, Object>> getPublicProjects() {
        Map<String, Object> response = new HashMap<>();
        response.put("projects", new Object[] {});
        response.put("total", 0);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<Map<String, Object>> getPublicTransactions() {
        Map<String, Object> response = new HashMap<>();
        response.put("transactions", new Object[] {});
        response.put("total", 0);
        return ResponseEntity.ok(response);
    }
}
