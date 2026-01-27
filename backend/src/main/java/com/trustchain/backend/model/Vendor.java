package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "vendor")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vendor_id")
    private UUID vendorId;

    @Column(name = "name")
    private String name;

    @Column(name = "password")
    private String password;

    @Column(name = "gstin")
    private String gstin;

    @Column(name = "kyc_status")
    private String kycStatus;

    @Column(name = "wallet_address")
    private String walletAddress;

    // Constructors
    public Vendor() {
    }

    public Vendor(String name, String password, String gstin, String kycStatus, String walletAddress) {
        this.name = name;
        this.password = password;
        this.gstin = gstin;
        this.kycStatus = kycStatus;
        this.walletAddress = walletAddress;
    }

    // Getters and Setters
    public UUID getVendorId() {
        return vendorId;
    }

    public void setVendorId(UUID vendorId) {
        this.vendorId = vendorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getKycStatus() {
        return kycStatus;
    }

    public void setKycStatus(String kycStatus) {
        this.kycStatus = kycStatus;
    }

    public String getWalletAddress() {
        return walletAddress;
    }

    public void setWalletAddress(String walletAddress) {
        this.walletAddress = walletAddress;
    }
}
