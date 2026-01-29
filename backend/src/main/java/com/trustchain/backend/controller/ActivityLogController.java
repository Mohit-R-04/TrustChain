package com.trustchain.backend.controller;

import com.trustchain.backend.model.ActivityLog;
import com.trustchain.backend.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    // Advanced API: Paginated + Filtered
    @GetMapping("/filter")
    public ResponseEntity<Page<ActivityLog>> filterLogs(
            @RequestParam(required = false) String actorRole,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String schemeId,
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String stateId,
            @RequestParam(required = false) String districtId,
            Pageable pageable) {

        Specification<ActivityLog> spec = Specification.where(null);

        if (actorRole != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("actorRole"), actorRole));
        if (severity != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("severityLevel"), severity));
        if (schemeId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("targetEntityId"), schemeId));
        if (actorId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("actorId"), actorId));
        
        if (startDate != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("timestamp"), startDate.atStartOfDay()));
        }
        if (endDate != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("timestamp"), endDate.atTime(23, 59, 59)));
        }

        if (tenantId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("tenantId"), tenantId));
        if (stateId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("stateId"), stateId));
        if (districtId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("districtId"), districtId));

        return ResponseEntity.ok(activityLogService.getLogs(spec, pageable));
    }

    // Get logs for the currently logged-in user (Paginated)
    @GetMapping("/my-logs")
    public ResponseEntity<Page<ActivityLog>> getMyLogs(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();

        Specification<ActivityLog> spec = (root, query, cb) -> cb.equal(root.get("actorId"), currentUserId);
        return ResponseEntity.ok(activityLogService.getLogs(spec, pageable));
    }

    // Compliance Export (CSV)
    @GetMapping("/export")
    public ResponseEntity<String> exportLogs(
            @RequestParam(required = false) String actorRole,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        // Fetch all matching logs (without pagination for export)
        Specification<ActivityLog> spec = Specification.where(null);
        if (actorRole != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("actorRole"), actorRole));
        if (startDate != null) spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("timestamp"), startDate.atStartOfDay()));
        if (endDate != null) spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("timestamp"), endDate.atTime(23, 59, 59)));

        // We use a large page size or a separate service method to fetch list. 
        // Reusing getLogs with unpaged if possible, or just casting.
        // For simplicity, let's assume we want max 10000 for export to avoid memory issues.
        List<ActivityLog> logs = activityLogService.getLogs(spec, Pageable.unpaged()).getContent();
        
        String csvContent = activityLogService.exportLogsToCSV(logs);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=activity_logs.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }

    @GetMapping("/entity/{type}/{id}")
    public ResponseEntity<Page<ActivityLog>> getEntityLogs(
            @PathVariable String type,
            @PathVariable String id,
            Pageable pageable) {
        Specification<ActivityLog> spec = Specification.where((root, query, cb) -> cb.and(
                cb.equal(root.get("targetEntityType"), type),
                cb.equal(root.get("targetEntityId"), id)
        ));
        return ResponseEntity.ok(activityLogService.getLogs(spec, pageable));
    }

    @GetMapping("/daily-audit-summary")
    public ResponseEntity<List<com.trustchain.backend.model.DailyAuditSummary>> getDailyAuditSummaries() {
        return ResponseEntity.ok(activityLogService.getAllDailyAuditSummaries());
    }
}
