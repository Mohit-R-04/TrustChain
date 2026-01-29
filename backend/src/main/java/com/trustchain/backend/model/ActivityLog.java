package com.trustchain.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Enterprise Grade Activity Log
 * Immutable, Indexed, Partition-Ready
 */
@Entity
@Immutable
@Table(name = "activity_log", indexes = {
    @Index(name = "idx_activity_actor_time", columnList = "actor_id, timestamp"),
    @Index(name = "idx_activity_role_time", columnList = "actor_role, timestamp"),
    @Index(name = "idx_activity_scheme_time", columnList = "target_entity_id, timestamp"),
    @Index(name = "idx_activity_severity", columnList = "severity_level"),
    @Index(name = "idx_activity_tenant", columnList = "tenant_id"),
    @Index(name = "idx_activity_state", columnList = "state_id"),
    @Index(name = "idx_activity_district", columnList = "district_id")
})
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id")
    private UUID logId;

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "actor_role", nullable = false)
    private String actorRole; // GOVERNMENT, NGO, VENDOR, DONOR, AUDITOR

    @Column(name = "action_type", nullable = false)
    private String actionType; // CREATE_SCHEME, UPLOAD_INVOICE, etc.

    @Column(name = "target_entity_type")
    private String targetEntityType; // Scheme, Vendor, Invoice, etc.

    @Column(name = "target_entity_id")
    private String targetEntityId;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON details

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "severity_level")
    private String severityLevel; // INFO, WARNING, CRITICAL

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // Multi-Tenancy Fields
    @Column(name = "state_id")
    private String stateId;

    @Column(name = "district_id")
    private String districtId;

    @Column(name = "tenant_id")
    private String tenantId;

    public ActivityLog() {
        this.timestamp = LocalDateTime.now();
    }

    // Builder-like constructor for convenience
    public ActivityLog(String actorId, String actorRole, String actionType, String targetEntityType, 
                       String targetEntityId, String metadata, String ipAddress, 
                       String severityLevel, String userAgent, String tenantId) {
        this.actorId = actorId;
        this.actorRole = actorRole;
        this.actionType = actionType;
        this.targetEntityType = targetEntityType;
        this.targetEntityId = targetEntityId;
        this.metadata = metadata;
        this.ipAddress = ipAddress;
        this.severityLevel = severityLevel;
        this.userAgent = userAgent;
        this.tenantId = tenantId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters (only Getters strictly needed for Immutable, but JPA needs Setters often)
    public UUID getLogId() { return logId; }
    public void setLogId(UUID logId) { this.logId = logId; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getTargetEntityType() { return targetEntityType; }
    public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }

    public String getTargetEntityId() { return targetEntityId; }
    public void setTargetEntityId(String targetEntityId) { this.targetEntityId = targetEntityId; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(String severityLevel) { this.severityLevel = severityLevel; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getStateId() { return stateId; }
    public void setStateId(String stateId) { this.stateId = stateId; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}
