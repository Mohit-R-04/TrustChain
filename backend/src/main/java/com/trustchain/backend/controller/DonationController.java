package com.trustchain.backend.controller;

import com.trustchain.backend.model.Donation;
import com.trustchain.backend.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Donation> createDonation(@RequestBody Donation donation) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Donation> updateDonation(@PathVariable UUID id, @RequestBody Donation donation) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
