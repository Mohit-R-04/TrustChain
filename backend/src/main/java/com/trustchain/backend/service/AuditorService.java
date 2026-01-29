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
        return auditorRepository.findAll();
    }

    public Auditor getAuditorByUserId(String userId) {
        return auditorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Auditor not found"));
    }

    public Optional<Auditor> getAuditorById(UUID id) {
        return auditorRepository.findById(id);
    }

    public Auditor createAuditor(Auditor auditor) {
        return auditorRepository.save(auditor);
    }

    public Auditor updateAuditor(UUID id, Auditor auditor) {
        if (auditorRepository.existsById(id)) {
            auditor.setAuditorId(id);
            return auditorRepository.save(auditor);
        }
        return null;
    }

    public void deleteAuditor(UUID id) {
        auditorRepository.deleteById(id);
    }
}
