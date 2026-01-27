package com.trustchain.backend.controller;

import com.trustchain.backend.model.Ngo;
import com.trustchain.backend.service.NgoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngo")
public class NgoController {

    @Autowired
    private NgoService ngoService;

    @GetMapping
    public ResponseEntity<List<Ngo>> getAllNgos() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ngo> getNgoById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Ngo> createNgo(@RequestBody Ngo ngo) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ngo> updateNgo(@PathVariable UUID id, @RequestBody Ngo ngo) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNgo(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
