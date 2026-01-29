package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ngo_vendor")
public class NgoVendor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ngo_vendor_id")
    private UUID ngoVendorId;

    @ManyToOne
    @JoinColumn(name = "manage_id", referencedColumnName = "manage_id")
    private Manage manage;

    @ManyToOne
    @JoinColumn(name = "vendor_id", referencedColumnName = "vendor_id")
    private Vendor vendor;

    @Column(name = "allocated_budget")
    private Double allocatedBudget;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public NgoVendor() {
    }

    public NgoVendor(Manage manage, Vendor vendor, Double allocatedBudget, String status, LocalDateTime createdAt) {
        this.manage = manage;
        this.vendor = vendor;
        this.allocatedBudget = allocatedBudget;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getNgoVendorId() {
        return ngoVendorId;
    }

    public void setNgoVendorId(UUID ngoVendorId) {
        this.ngoVendorId = ngoVendorId;
    }

    public Manage getManage() {
        return manage;
    }

    public void setManage(Manage manage) {
        this.manage = manage;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public Double getAllocatedBudget() {
        return allocatedBudget;
    }

    public void setAllocatedBudget(Double allocatedBudget) {
        this.allocatedBudget = allocatedBudget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
