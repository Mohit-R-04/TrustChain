package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transaction")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transaction_id")
    private UUID transactionId;

    @ManyToOne
    @JoinColumn(name = "manage_id", referencedColumnName = "manage_id")
    private Manage manage;

    @Column(name = "escrow_contract_address")
    private String escrowContractAddress;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public Transaction() {
    }

    public Transaction(Manage manage, String escrowContractAddress, Double totalAmount, String status,
            LocalDateTime createdAt) {
        this.manage = manage;
        this.escrowContractAddress = escrowContractAddress;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(UUID transactionId) {
        this.transactionId = transactionId;
    }

    public Manage getManage() {
        return manage;
    }

    public void setManage(Manage manage) {
        this.manage = manage;
    }

    public String getEscrowContractAddress() {
        return escrowContractAddress;
    }

    public void setEscrowContractAddress(String escrowContractAddress) {
        this.escrowContractAddress = escrowContractAddress;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
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
