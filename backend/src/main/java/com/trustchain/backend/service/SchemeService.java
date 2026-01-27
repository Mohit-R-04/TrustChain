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
        // TODO: Implement method
        return null;
    }

    public Optional<Scheme> getSchemeById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Scheme createScheme(Scheme scheme) {
        // TODO: Implement method
        return null;
    }

    public Scheme updateScheme(UUID id, Scheme scheme) {
        // TODO: Implement method
        return null;
    }

    public void deleteScheme(UUID id) {
        // TODO: Implement method
    }
}
