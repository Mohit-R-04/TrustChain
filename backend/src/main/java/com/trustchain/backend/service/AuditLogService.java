package com.trustchain.backend.service;

import com.trustchain.backend.model.AuditLog;
import com.trustchain.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<AuditLog> getAllAuditLogs() {
        // TODO: Implement method
        return null;
    }

    public Optional<AuditLog> getAuditLogById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public AuditLog createAuditLog(AuditLog auditLog) {
        // TODO: Implement method
        return null;
    }

    public AuditLog updateAuditLog(UUID id, AuditLog auditLog) {
        // TODO: Implement method
        return null;
    }

    public void deleteAuditLog(UUID id) {
        // TODO: Implement method
    }
}
