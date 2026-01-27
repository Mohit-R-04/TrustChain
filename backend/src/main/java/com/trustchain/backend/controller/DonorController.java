package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.Donor;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.service.DonorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/donor")
public class DonorController {

    @Autowired
    private DonorService donorService;

    @GetMapping("/dashboard")
    @RequireRole(UserRole.DONOR)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Donor Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "DONOR");
        response.put("stats", Map.of(
                "totalDonations", 0,
                "activeProjects", 0,
                "verifiedTransactions", 0));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/donate")
    @RequireRole(UserRole.DONOR)
    public ResponseEntity<Map<String, String>> makeDonation(
            @RequestBody Map<String, Object> donationData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Donation initiated successfully");
        response.put("donorId", authentication.getName());
        response.put("status", "pending_verification");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    @RequireRole(UserRole.DONOR)
    public ResponseEntity<Map<String, Object>> getTransactions(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", authentication.getName());
        response.put("transactions", new Object[] {});
        return ResponseEntity.ok(response);
    }

    // CRUD Endpoints
    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donor> getDonorById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Donor> createDonor(@RequestBody Donor donor) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Donor> updateDonor(@PathVariable UUID id, @RequestBody Donor donor) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonor(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
