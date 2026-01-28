package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "donor")
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "donor_id")
    private UUID donorId;

    @Column(name = "name")
    private String name;

    @Column(name = "password")
    private String password;

    @Column(name = "auth_id")
    private String authId;

    @Column(name = "email")
    private String email;

    // Constructors
    public Donor() {
    }

    public Donor(String name, String password) {
        this.name = name;
        this.password = password;
    }

    // Getters and Setters
    public UUID getDonorId() {
        return donorId;
    }

    public void setDonorId(UUID donorId) {
        this.donorId = donorId;
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

    public String getAuthId() {
        return authId;
    }

    public void setAuthId(String authId) {
        this.authId = authId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
