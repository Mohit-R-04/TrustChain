package com.trustchain.backend.controller;

import com.trustchain.backend.dto.DonationRequest;
import com.trustchain.backend.model.Donation;
import com.trustchain.backend.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/donation")
public class DonationController {

    @Autowired
    private DonationService donationService;

    @GetMapping
    public ResponseEntity<List<Donation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Donation>> getDonationsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(donationService.getDonationsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable UUID id) {
        return donationService.getDonationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Donation> createDonation(@RequestBody DonationRequest request, Authentication authentication) {
        boolean isGovernment = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_GOVERNMENT".equals(a.getAuthority()));
        if (isGovernment) {
            return ResponseEntity.ok(donationService.processDonationAsGovernment(request, authentication.getName()));
        }
        return ResponseEntity.ok(donationService.processDonation(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Donation> updateDonation(@PathVariable UUID id, @RequestBody Donation donation) {
        // Not implemented for now
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable UUID id) {
        // Not implemented for now
        return null;
    }
}
