package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "receipt")
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "receipt_id")
    private UUID receiptId;

    @ManyToOne
    @JoinColumn(name = "vendor_id", referencedColumnName = "vendor_id")
    private Vendor vendor;

    @ManyToOne
    @JoinColumn(name = "manage_id", referencedColumnName = "manage_id")
    private Manage manage;

    @Column(name = "receipt_ipfs_hash")
    private String receiptIpfsHash;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public Receipt() {
    }

    public Receipt(Vendor vendor, Manage manage, String receiptIpfsHash, String status, LocalDateTime createdAt) {
        this.vendor = vendor;
        this.manage = manage;
        this.receiptIpfsHash = receiptIpfsHash;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(UUID receiptId) {
        this.receiptId = receiptId;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public Manage getManage() {
        return manage;
    }

    public void setManage(Manage manage) {
        this.manage = manage;
    }

    public String getReceiptIpfsHash() {
        return receiptIpfsHash;
    }

    public void setReceiptIpfsHash(String receiptIpfsHash) {
        this.receiptIpfsHash = receiptIpfsHash;
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
