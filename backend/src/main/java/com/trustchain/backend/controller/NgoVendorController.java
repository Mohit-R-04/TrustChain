package com.trustchain.backend.controller;

import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.service.NgoVendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngo-vendor")
public class NgoVendorController {

    @Autowired
    private NgoVendorService ngoVendorService;

    @GetMapping
    public ResponseEntity<List<NgoVendor>> getAllNgoVendors() {
        return ResponseEntity.ok(ngoVendorService.getAllNgoVendors());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NgoVendor>> getNgoVendorsByVendorUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ngoVendorService.getNgoVendorsByVendorUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NgoVendor> getNgoVendorById(@PathVariable UUID id) {
        return ngoVendorService.getNgoVendorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NgoVendor> createNgoVendor(@RequestBody NgoVendor ngoVendor) {
        return ResponseEntity.ok(ngoVendorService.createNgoVendor(ngoVendor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NgoVendor> updateNgoVendor(@PathVariable UUID id, @RequestBody NgoVendor ngoVendor) {
        NgoVendor updatedNgoVendor = ngoVendorService.updateNgoVendor(id, ngoVendor);
        return updatedNgoVendor != null ? ResponseEntity.ok(updatedNgoVendor) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<NgoVendor> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        return ResponseEntity.ok(ngoVendorService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNgoVendor(@PathVariable UUID id) {
        ngoVendorService.deleteNgoVendor(id);
        return ResponseEntity.noContent().build();
    }
}
