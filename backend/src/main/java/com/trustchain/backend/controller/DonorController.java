package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.dto.DonationRequest;
import com.trustchain.backend.model.Donation;
import com.trustchain.backend.model.Donor;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.service.DonationService;
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
    
    @Autowired
    private DonationService donationService;

    @GetMapping("/dashboard")
    @RequireRole(UserRole.DONOR)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Donor Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "DONOR");
        
        Map<String, Object> stats = donationService.getDonorStats(authentication.getName());
        response.put("stats", stats);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/donate")
    @RequireRole(UserRole.DONOR)
    public ResponseEntity<Map<String, Object>> makeDonation(
            @RequestBody DonationRequest donationRequest,
            Authentication authentication) {
        try {
            Donation donation = donationService.processDonation(donationRequest, authentication.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Donation successful");
            response.put("donationId", donation.getDonationId());
            response.put("transactionRef", donation.getTransactionRef());
            response.put("amount", donation.getAmount());
            response.put("status", "completed");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Donation failed: " + e.getMessage());
            response.put("status", "failed");
            return ResponseEntity.badRequest().body(response);
        }
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
        return ResponseEntity.ok(donorService.getAllDonors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donor> getDonorById(@PathVariable UUID id) {
        return donorService.getDonorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Donor> createDonor(@RequestBody Donor donor) {
        return ResponseEntity.ok(donorService.createDonor(donor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Donor> updateDonor(@PathVariable UUID id, @RequestBody Donor donor) {
        Donor updated = donorService.updateDonor(id, donor);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonor(@PathVariable UUID id) {
        donorService.deleteDonor(id);
        return ResponseEntity.ok().build();
    }
}
