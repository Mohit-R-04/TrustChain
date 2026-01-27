package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id")
    private UUID logId;

    @ManyToOne
    @JoinColumn(name = "auditor_id", referencedColumnName = "auditor_id")
    private Auditor auditor;

    @ManyToOne
    @JoinColumn(name = "manage_id", referencedColumnName = "manage_id")
    private Manage manage;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public AuditLog() {
    }

    public AuditLog(Auditor auditor, Manage manage, String remarks, LocalDateTime createdAt) {
        this.auditor = auditor;
        this.manage = manage;
        this.remarks = remarks;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getLogId() {
        return logId;
    }

    public void setLogId(UUID logId) {
        this.logId = logId;
    }

    public Auditor getAuditor() {
        return auditor;
    }

    public void setAuditor(Auditor auditor) {
        this.auditor = auditor;
    }

    public Manage getManage() {
        return manage;
    }

    public void setManage(Manage manage) {
        this.manage = manage;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
