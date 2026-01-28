package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.Ngo;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.service.NgoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngo")
public class NgoController {

    @Autowired
    private NgoService ngoService;

    @GetMapping("/dashboard")
    @RequireRole(UserRole.NGO)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to NGO Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "NGO");
        response.put("stats", Map.of(
                "activeProjects", 0,
                "fundsReceived", 0,
                "beneficiaries", 0));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Ngo> getNgoByUserId(@PathVariable String userId) {
        return ngoService.getNgoByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Ngo>> getAllNgos() {
        return ResponseEntity.ok(ngoService.getAllNgos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ngo> getNgoById(@PathVariable UUID id) {
        return ngoService.getNgoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Ngo> createNgo(@RequestBody Ngo ngo) {
        return ResponseEntity.ok(ngoService.createNgo(ngo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ngo> updateNgo(@PathVariable UUID id, @RequestBody Ngo ngo) {
        Ngo updated = ngoService.updateNgo(id, ngo);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNgo(@PathVariable UUID id) {
        ngoService.deleteNgo(id);
        return ResponseEntity.ok().build();
    }
}
