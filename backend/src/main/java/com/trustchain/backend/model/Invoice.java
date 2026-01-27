package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoice")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "invoice_id")
    private UUID invoiceId;

    @ManyToOne
    @JoinColumn(name = "vendor_id", referencedColumnName = "vendor_id")
    private Vendor vendor;

    @ManyToOne
    @JoinColumn(name = "manage_id", referencedColumnName = "manage_id")
    private Manage manage;

    @Column(name = "invoice_ipfs_hash")
    private String invoiceIpfsHash;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public Invoice() {
    }

    public Invoice(Vendor vendor, Manage manage, String invoiceIpfsHash, String status, LocalDateTime createdAt) {
        this.vendor = vendor;
        this.manage = manage;
        this.invoiceIpfsHash = invoiceIpfsHash;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
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

    public String getInvoiceIpfsHash() {
        return invoiceIpfsHash;
    }

    public void setInvoiceIpfsHash(String invoiceIpfsHash) {
        this.invoiceIpfsHash = invoiceIpfsHash;
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
