package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_audit_summary")
public class DailyAuditSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "audit_date", nullable = false, unique = true)
    private LocalDate auditDate;

    @Column(name = "merkle_root_hash", nullable = false)
    private String merkleRootHash;

    @Column(name = "total_logs")
    private long totalLogs;

    @Column(name = "status")
    private String status; // PENDING, ON_CHAIN

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public DailyAuditSummary() {
        this.createdAt = LocalDateTime.now();
    }

    public DailyAuditSummary(LocalDate auditDate, String merkleRootHash, long totalLogs, String status) {
        this.auditDate = auditDate;
        this.merkleRootHash = merkleRootHash;
        this.totalLogs = totalLogs;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public LocalDate getAuditDate() { return auditDate; }
    public void setAuditDate(LocalDate auditDate) { this.auditDate = auditDate; }
    public String getMerkleRootHash() { return merkleRootHash; }
    public void setMerkleRootHash(String merkleRootHash) { this.merkleRootHash = merkleRootHash; }
    public long getTotalLogs() { return totalLogs; }
    public void setTotalLogs(long totalLogs) { this.totalLogs = totalLogs; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
