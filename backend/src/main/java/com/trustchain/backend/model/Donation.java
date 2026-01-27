package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "donation")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "donation_id")
    private UUID donationId;

    @ManyToOne
    @JoinColumn(name = "donor_id", referencedColumnName = "donor_id", nullable = true)
    private Donor donor;

    @ManyToOne
    @JoinColumn(name = "govt_id", referencedColumnName = "govt_id", nullable = true)
    private Government government;

    @ManyToOne
    @JoinColumn(name = "scheme_id", referencedColumnName = "scheme_id")
    private Scheme scheme;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "transaction_ref")
    private String transactionRef;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    // Constructors
    public Donation() {
    }

    public Donation(Scheme scheme, Double amount, String transactionRef, LocalDateTime timestamp) {
        this.scheme = scheme;
        this.amount = amount;
        this.transactionRef = transactionRef;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public UUID getDonationId() {
        return donationId;
    }

    public void setDonationId(UUID donationId) {
        this.donationId = donationId;
    }

    public Donor getDonor() {
        return donor;
    }

    public void setDonor(Donor donor) {
        this.donor = donor;
    }

    public Government getGovernment() {
        return government;
    }

    public void setGovernment(Government government) {
        this.government = government;
    }

    public Scheme getScheme() {
        return scheme;
    }

    public void setScheme(Scheme scheme) {
        this.scheme = scheme;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
