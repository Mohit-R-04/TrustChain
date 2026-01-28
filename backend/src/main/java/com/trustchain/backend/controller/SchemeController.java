package com.trustchain.backend.controller;

import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scheme")
public class SchemeController {

    @Autowired
    private SchemeService schemeService;

    @GetMapping
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scheme> getSchemeById(@PathVariable UUID id) {
        return schemeService.getSchemeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Scheme> createScheme(@RequestBody Scheme scheme) {
        return ResponseEntity.ok(schemeService.createScheme(scheme));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Scheme> updateScheme(@PathVariable UUID id, @RequestBody Scheme scheme) {
        Scheme updatedScheme = schemeService.updateScheme(id, scheme);
        if (updatedScheme != null) {
            return ResponseEntity.ok(updatedScheme);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScheme(@PathVariable UUID id) {
        schemeService.deleteScheme(id);
        return ResponseEntity.ok().build();
    }
}
