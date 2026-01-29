package com.trustchain.backend.service;

import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.repository.SchemeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SchemeService {

    @Autowired
    private SchemeRepository schemeRepository;

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
            scheme.setCreatedAt(java.time.LocalDateTime.now());
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
}
