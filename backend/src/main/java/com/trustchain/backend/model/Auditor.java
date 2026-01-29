package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "auditor")
public class Auditor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "auditor_id")
    private UUID auditorId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "email")
    private String email;

    @Column(name = "name")
    private String name;

    @Column(name = "phone_number")
    private String phoneNumber;

    // Constructors
    public Auditor() {
    }

    // Getters and Setters
    public UUID getAuditorId() {
        return auditorId;
    }

    public void setAuditorId(UUID auditorId) {
        this.auditorId = auditorId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
