package com.trustchain.backend.controller;

import com.trustchain.backend.model.Vendor;
import com.trustchain.backend.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Vendor> createVendor(@RequestBody Vendor vendor) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateVendor(@PathVariable UUID id, @RequestBody Vendor vendor) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
