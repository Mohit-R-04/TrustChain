package com.trustchain.backend.service;

import com.trustchain.backend.model.Government;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.model.StateSchemeAcceptance;
import com.trustchain.backend.repository.GovernmentRepository;
import com.trustchain.backend.repository.SchemeRepository;
import com.trustchain.backend.repository.StateSchemeAcceptanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SchemeService {

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private GovernmentRepository governmentRepository;

    @Autowired
    private StateSchemeAcceptanceRepository acceptanceRepository;

    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public List<Scheme> getSchemesByCategory(String category) {
        return schemeRepository.findByCategory(category);
    }

    public Optional<Scheme> getSchemeById(UUID id) {
        return schemeRepository.findById(id);
    }

    public Scheme createScheme(Scheme scheme) {
        if (scheme.getCreatedAt() == null) {
            scheme.setCreatedAt(LocalDateTime.now());
        }
        return schemeRepository.save(scheme);
    }

    public Scheme updateScheme(UUID id, Scheme scheme) {
        if (schemeRepository.existsById(id)) {
            scheme.setSchemeId(id);
            return schemeRepository.save(scheme);
        }
        return null;
    }

    public void deleteScheme(UUID id) {
        schemeRepository.deleteById(id);
    }

    public void adoptScheme(String userId, UUID schemeId) {
        Government govt = governmentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Government not found"));

        Scheme scheme = schemeRepository.findById(schemeId)
                .orElseThrow(() -> new RuntimeException("Scheme not found"));

        // Only allow adoption of CENTRAL_OPTIONAL or CENTRAL_MANDATORY (if not auto-accepted)
        if (!scheme.getSchemeType().startsWith("CENTRAL")) {
            throw new RuntimeException("Only CENTRAL schemes can be adopted");
        }

        Optional<StateSchemeAcceptance> existing = acceptanceRepository.findByGovernmentAndScheme(govt, scheme);
        if (existing.isPresent()) {
            return; // Already adopted
        }

        StateSchemeAcceptance acceptance = new StateSchemeAcceptance(govt, scheme, LocalDateTime.now(), "ACCEPTED");
        acceptanceRepository.save(acceptance);
    }

    public List<Scheme> getSchemesForGovernment(String userId) {
        Government govt = governmentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Government not found"));

        if ("CENTRAL".equals(govt.getType())) {
            // Central sees only schemes created by Central Govt (which are its own schemes in current logic)
            // Or explicitly schemes created by this user
            return govt.getSchemes();
        } else {
            // STATE sees:
            // 1. Schemes created by itself (STATE schemes)
            List<Scheme> myCreatedSchemes = govt.getSchemes();
            
            // 2. Accepted Central Schemes
            List<StateSchemeAcceptance> acceptances = acceptanceRepository.findByGovernment(govt);
            List<Scheme> acceptedSchemes = acceptances.stream()
                    .map(StateSchemeAcceptance::getScheme)
                    .collect(Collectors.toList());

            // 3. Mandatory Central Schemes (Auto-include if not explicitly accepted yet, though they should be accepted)
            // For now, let's assume they MUST accept to see them in "My Schemes", 
            // OR we can auto-show them. The requirement says "Must Accept First".
            // So we only show what is in acceptance table + created by self.
            
            List<Scheme> allMySchemes = new ArrayList<>(myCreatedSchemes);
            allMySchemes.addAll(acceptedSchemes);
            
            return allMySchemes.stream().distinct().collect(Collectors.toList());
        }
    }

    public List<Scheme> getAvailableForAdoption(String userId) {
        Government govt = governmentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Government not found"));

        if ("CENTRAL".equals(govt.getType())) {
            return List.of();
        }

        // Get all Central schemes
        List<Scheme> centralSchemes = schemeRepository.findAll().stream()
                .filter(s -> s.getSchemeType() != null && s.getSchemeType().startsWith("CENTRAL"))
                .collect(Collectors.toList());

        // Get already accepted schemes
        List<Scheme> acceptedSchemes = acceptanceRepository.findByGovernment(govt).stream()
                .map(StateSchemeAcceptance::getScheme)
                .collect(Collectors.toList());

        // Return Central schemes NOT yet accepted
        return centralSchemes.stream()
                .filter(s -> !acceptedSchemes.contains(s))
                .collect(Collectors.toList());
    }
}
