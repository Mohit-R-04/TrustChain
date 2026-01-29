package com.trustchain.backend.service;

import com.trustchain.backend.model.AuditLog;
import com.trustchain.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    public Optional<AuditLog> getAuditLogById(UUID id) {
        return auditLogRepository.findById(id);
    }

    public AuditLog createAuditLog(AuditLog auditLog) {
        if (auditLog.getCreatedAt() == null) {
            auditLog.setCreatedAt(LocalDateTime.now());
        }
        return auditLogRepository.save(auditLog);
    }

    public AuditLog updateAuditLog(UUID id, AuditLog auditLog) {
        return auditLogRepository.findById(id).map(existingLog -> {
            existingLog.setRemarks(auditLog.getRemarks());
            // Update other fields if necessary
            return auditLogRepository.save(existingLog);
        }).orElse(null);
    }

    public void deleteAuditLog(UUID id) {
        auditLogRepository.deleteById(id);
    }
}
