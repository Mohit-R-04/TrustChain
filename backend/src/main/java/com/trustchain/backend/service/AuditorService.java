package com.trustchain.backend.service;

import com.trustchain.backend.model.Auditor;
import com.trustchain.backend.repository.AuditorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuditorService {

    @Autowired
    private AuditorRepository auditorRepository;

    public List<Auditor> getAllAuditors() {
        // TODO: Implement method
        return null;
    }

    public Optional<Auditor> getAuditorById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Auditor createAuditor(Auditor auditor) {
        // TODO: Implement method
        return null;
    }

    public Auditor updateAuditor(UUID id, Auditor auditor) {
        // TODO: Implement method
        return null;
    }

    public void deleteAuditor(UUID id) {
        // TODO: Implement method
    }
}
