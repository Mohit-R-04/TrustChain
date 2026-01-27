package com.trustchain.backend.controller;

import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.service.NgoVendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngo-vendor")
public class NgoVendorController {

    @Autowired
    private NgoVendorService ngoVendorService;

    @GetMapping
    public ResponseEntity<List<NgoVendor>> getAllNgoVendors() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<NgoVendor> getNgoVendorById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<NgoVendor> createNgoVendor(@RequestBody NgoVendor ngoVendor) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<NgoVendor> updateNgoVendor(@PathVariable UUID id, @RequestBody NgoVendor ngoVendor) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNgoVendor(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
