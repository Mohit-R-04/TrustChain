package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.Government;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.repository.GovernmentRepository;
import com.trustchain.backend.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scheme")
@CrossOrigin(origins = "*")
public class SchemeController {

    @Autowired
    private SchemeService schemeService;

    @Autowired
    private GovernmentRepository governmentRepository;

    @GetMapping
    public ResponseEntity<List<Scheme>> getAllSchemes(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(schemeService.getSchemesByCategory(category));
        }
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scheme> getSchemeById(@PathVariable UUID id) {
        return schemeService.getSchemeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<Scheme> createScheme(@RequestBody Scheme scheme, Authentication authentication) {
        String userId = authentication.getName();
        Government government = governmentRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Government g = new Government();
                    g.setUserId(userId);
                    g.setGovtName("Government " + (userId.length() > 5 ? userId.substring(0, 5) : userId));
                    return governmentRepository.save(g);
                });
        
        // Enforce scheme type
        if ("CENTRAL".equals(government.getType())) {
            if (scheme.getSchemeType() == null || 
               (!"CENTRAL_MANDATORY".equals(scheme.getSchemeType()) && 
                !"CENTRAL_OPTIONAL".equals(scheme.getSchemeType()))) {
                // Default to MANDATORY if not specified or invalid
                scheme.setSchemeType("CENTRAL_MANDATORY");
            }
        } else {
            // STATE
            scheme.setSchemeType("STATE");
        }
        
        scheme.setGovernment(government);
        return ResponseEntity.ok(schemeService.createScheme(scheme));
    }
    
    @PostMapping("/adopt/{schemeId}")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<?> adoptScheme(@PathVariable UUID schemeId, Authentication authentication) {
        try {
            schemeService.adoptScheme(authentication.getName(), schemeId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/my-schemes")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<List<Scheme>> getMySchemes(Authentication authentication) {
        return ResponseEntity.ok(schemeService.getSchemesForGovernment(authentication.getName()));
    }
    
    @GetMapping("/available-for-adoption")
    @RequireRole(UserRole.GOVERNMENT)
    public ResponseEntity<List<Scheme>> getAvailableSchemes(Authentication authentication) {
        return ResponseEntity.ok(schemeService.getAvailableForAdoption(authentication.getName()));
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
