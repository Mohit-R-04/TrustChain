package com.trustchain.backend.controller;

import com.trustchain.backend.model.Auditor;
import com.trustchain.backend.service.AuditorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auditor")
public class AuditorController {

    @Autowired
    private AuditorService auditorService;

    @GetMapping
    public ResponseEntity<List<Auditor>> getAllAuditors() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auditor> getAuditorById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Auditor> createAuditor(@RequestBody Auditor auditor) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Auditor> updateAuditor(@PathVariable UUID id, @RequestBody Auditor auditor) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditor(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
