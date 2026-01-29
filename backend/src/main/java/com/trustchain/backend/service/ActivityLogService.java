package com.trustchain.backend.service;

import com.trustchain.backend.event.ActivityLogEvent;
import com.trustchain.backend.model.ActivityLog;
import com.trustchain.backend.model.DailyAuditSummary;
import com.trustchain.backend.repository.ActivityLogRepository;
import com.trustchain.backend.repository.DailyAuditSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    @Autowired
    private DailyAuditSummaryRepository dailyAuditSummaryRepository;

    @Autowired
    private LoggingQueueService loggingQueueService;

    /**
     * Publishes an activity log event.
     * Replaces direct DB saving to enable Event Queue architecture.
     */
    public void logActivity(String actorId, String actorRole, String action, String entityId, String entityType, String details, String ipAddress) {
        // Overloaded for backward compatibility
        logActivityExtended(actorId, actorRole, action, entityType, entityId, details, ipAddress, "UNKNOWN", "INFO", null);
    }

    public void logActivityExtended(String actorId, String actorRole, String action, String entityType, String entityId, 
                                    String metadata, String ipAddress, String userAgent, String severity, String tenantId) {
        ActivityLogEvent event = new ActivityLogEvent(
            this, actorId, actorRole, action, entityType, entityId, metadata, ipAddress, userAgent, severity, tenantId
        );
        loggingQueueService.enqueueEvent(event);
    }

    public Page<ActivityLog> getLogs(Specification<ActivityLog> spec, Pageable pageable) {
        return activityLogRepository.findAll(spec, pageable);
    }

    public List<ActivityLog> getLogsByActor(String actorId) {
        return activityLogRepository.findByActorIdOrderByTimestampDesc(actorId);
    }

    public List<DailyAuditSummary> getAllDailyAuditSummaries() {
        return dailyAuditSummaryRepository.findAll();
    }

    // --- Export Functionality ---
    public String exportLogsToCSV(List<ActivityLog> logs) {
        StringBuilder csv = new StringBuilder();
        csv.append("LogID,Timestamp,ActorID,ActorRole,Action,Entity,EntityID,Details,IP,Severity\n");
        for (ActivityLog log : logs) {
            csv.append(log.getLogId()).append(",")
               .append(log.getTimestamp()).append(",")
               .append(escapeCsv(log.getActorId())).append(",")
               .append(log.getActorRole()).append(",")
               .append(log.getActionType()).append(",")
               .append(log.getTargetEntityType()).append(",")
               .append(log.getTargetEntityId()).append(",")
               .append(escapeCsv(log.getMetadata())).append(",")
               .append(log.getIpAddress()).append(",")
               .append(log.getSeverityLevel()).append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        return "\"" + data.replace("\"", "\"\"") + "\"";
    }

    // --- Tamper-Proof Merkle Root Logic ---

    /**
     * Scheduled task to generate daily Merkle Root of activity logs.
     * Runs every day at 00:01 AM.
     */
    @Scheduled(cron = "0 1 0 * * ?")
    public void generateDailyMerkleRoot() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfDay = yesterday.atStartOfDay();
        LocalDateTime endOfDay = yesterday.atTime(23, 59, 59);

        // Fetch all logs for yesterday (using Specification or custom query)
        // For simplicity, fetching all and filtering in memory (optimize for prod with DB query)
        List<ActivityLog> dailyLogs = activityLogRepository.findAll().stream()
                .filter(log -> log.getTimestamp().isAfter(startOfDay) && log.getTimestamp().isBefore(endOfDay))
                .sorted((a, b) -> a.getLogId().compareTo(b.getLogId())) // Deterministic sorting
                .collect(Collectors.toList());

        if (dailyLogs.isEmpty()) return;

        List<String> hashes = dailyLogs.stream()
                .map(this::hashLog)
                .collect(Collectors.toList());

        String rootHash = computeMerkleRoot(hashes);

        DailyAuditSummary summary = new DailyAuditSummary(yesterday, rootHash, dailyLogs.size(), "PENDING");
        dailyAuditSummaryRepository.save(summary);
    }

    private String hashLog(ActivityLog log) {
        String raw = log.getLogId() + log.getActorId() + log.getActionType() + log.getTimestamp();
        return sha256(raw);
    }

    private String computeMerkleRoot(List<String> hashes) {
        if (hashes.isEmpty()) return "";
        if (hashes.size() == 1) return hashes.get(0);

        List<String> nextLevel = new ArrayList<>();
        for (int i = 0; i < hashes.size(); i += 2) {
            String left = hashes.get(i);
            String right = (i + 1 < hashes.size()) ? hashes.get(i + 1) : left; // Duplicate last if odd
            nextLevel.add(sha256(left + right));
        }
        return computeMerkleRoot(nextLevel);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
