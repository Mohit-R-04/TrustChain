package com.trustchain.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoice_payout")
public class InvoicePayout {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "payout_id")
    private UUID payoutId;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "scheme_id")
    private UUID schemeId;

    @Column(name = "manage_id")
    private UUID manageId;

    @Column(name = "ngo_id")
    private UUID ngoId;

    @Column(name = "vendor_id")
    private UUID vendorId;

    @Column(name = "amount_inr")
    private Double amountInr;

    @Column(name = "amount_wei", length = 120)
    private String amountWei;

    @Column(name = "from_address", length = 80)
    private String fromAddress;

    @Column(name = "to_address", length = 80)
    private String toAddress;

    @Column(name = "tx_hash", length = 120)
    private String transactionHash;

    @Column(name = "status", length = 40)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public UUID getPayoutId() {
        return payoutId;
    }

    public void setPayoutId(UUID payoutId) {
        this.payoutId = payoutId;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public UUID getSchemeId() {
        return schemeId;
    }

    public void setSchemeId(UUID schemeId) {
        this.schemeId = schemeId;
    }

    public UUID getManageId() {
        return manageId;
    }

    public void setManageId(UUID manageId) {
        this.manageId = manageId;
    }

    public UUID getNgoId() {
        return ngoId;
    }

    public void setNgoId(UUID ngoId) {
        this.ngoId = ngoId;
    }

    public UUID getVendorId() {
        return vendorId;
    }

    public void setVendorId(UUID vendorId) {
        this.vendorId = vendorId;
    }

    public Double getAmountInr() {
        return amountInr;
    }

    public void setAmountInr(Double amountInr) {
        this.amountInr = amountInr;
    }

    public String getAmountWei() {
        return amountWei;
    }

    public void setAmountWei(String amountWei) {
        this.amountWei = amountWei;
    }

    public String getFromAddress() {
        return fromAddress;
    }

    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    public String getToAddress() {
        return toAddress;
    }

    public void setToAddress(String toAddress) {
        this.toAddress = toAddress;
    }

    public String getTransactionHash() {
        return transactionHash;
    }

    public void setTransactionHash(String transactionHash) {
        this.transactionHash = transactionHash;
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
