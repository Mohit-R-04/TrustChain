package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "government")
public class Government {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "govt_id")
    private UUID govtId;

    @Column(name = "govt_name")
    private String govtName;

    @Column(name = "password")
    private String password;

    @OneToMany(mappedBy = "government", cascade = CascadeType.ALL)
    private List<Scheme> schemes = new ArrayList<>();

    // Constructors
    public Government() {
    }

    public Government(String govtName, String password) {
        this.govtName = govtName;
        this.password = password;
    }

    // Getters and Setters
    public UUID getGovtId() {
        return govtId;
    }

    public void setGovtId(UUID govtId) {
        this.govtId = govtId;
    }

    public String getGovtName() {
        return govtName;
    }

    public void setGovtName(String govtName) {
        this.govtName = govtName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Scheme> getSchemes() {
        return schemes;
    }

    public void setSchemes(List<Scheme> schemes) {
        this.schemes = schemes;
    }
}
