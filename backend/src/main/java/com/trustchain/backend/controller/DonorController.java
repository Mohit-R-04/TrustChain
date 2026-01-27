package com.trustchain.backend.controller;

import com.trustchain.backend.model.Donor;
import com.trustchain.backend.service.DonorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/donor")
public class DonorController {

    @Autowired
    private DonorService donorService;

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
