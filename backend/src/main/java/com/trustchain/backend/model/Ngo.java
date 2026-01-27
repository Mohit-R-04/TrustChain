package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "ngo")
public class Ngo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ngo_id")
    private UUID ngoId;

    @Column(name = "name")
    private String name;

    @Column(name = "password")
    private String password;

    // Constructors
    public Ngo() {
    }

    public Ngo(String name, String password) {
        this.name = name;
        this.password = password;
    }

    // Getters and Setters
    public UUID getNgoId() {
        return ngoId;
    }

    public void setNgoId(UUID ngoId) {
        this.ngoId = ngoId;
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
