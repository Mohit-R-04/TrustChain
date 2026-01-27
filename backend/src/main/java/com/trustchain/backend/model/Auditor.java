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

    @Column(name = "name")
    private String name;

    @Column(name = "password")
    private String password;

    // Constructors
    public Auditor() {
    }

    public Auditor(String name, String password) {
        this.name = name;
        this.password = password;
    }

    // Getters and Setters
    public UUID getAuditorId() {
        return auditorId;
    }

    public void setAuditorId(UUID auditorId) {
        this.auditorId = auditorId;
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
}
