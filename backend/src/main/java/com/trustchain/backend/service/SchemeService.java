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

    public Optional<Scheme> getSchemeById(UUID id) {
        return schemeRepository.findById(id);
    }

    public Scheme createScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    public Scheme updateScheme(UUID id, Scheme schemeDetails) {
        return schemeRepository.findById(id).map(scheme -> {
            scheme.setSchemeName(schemeDetails.getSchemeName());
            scheme.setBudget(schemeDetails.getBudget());
            scheme.setStartDate(schemeDetails.getStartDate());
            scheme.setEndDate(schemeDetails.getEndDate());
            scheme.setIsFinished(schemeDetails.getIsFinished());
            scheme.setDescription(schemeDetails.getDescription());
            scheme.setCategory(schemeDetails.getCategory());
            scheme.setRegion(schemeDetails.getRegion());
            scheme.setDonatedAmount(schemeDetails.getDonatedAmount());
            return schemeRepository.save(scheme);
        }).orElseThrow(() -> new RuntimeException("Scheme not found with id " + id));
    }

    public void deleteScheme(UUID id) {
        schemeRepository.deleteById(id);
    }
}
