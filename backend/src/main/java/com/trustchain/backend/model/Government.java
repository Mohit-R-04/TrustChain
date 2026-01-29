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

    @Column(name = "user_id")
    private String userId;

    @Column(name = "email")
    private String email;

    @Column(name = "govt_name")
    private String govtName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "type")
    private String type;

    @OneToMany(mappedBy = "government", cascade = CascadeType.ALL)
    private List<Scheme> schemes = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "government_adopted_schemes",
        joinColumns = @JoinColumn(name = "govt_id"),
        inverseJoinColumns = @JoinColumn(name = "scheme_id")
    )
    private List<Scheme> adoptedSchemes = new ArrayList<>();

    // Constructors
    public Government() {
    }

    public Government(String govtName) {
        this.govtName = govtName;
    }

    // Getters and Setters
    public UUID getGovtId() {
        return govtId;
    }

    public void setGovtId(UUID govtId) {
        this.govtId = govtId;
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

    public String getGovtName() {
        return govtName;
    }

    public void setGovtName(String govtName) {
        this.govtName = govtName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Scheme> getSchemes() {
        return schemes;
    }

    public void setSchemes(List<Scheme> schemes) {
        this.schemes = schemes;
    }

    public List<Scheme> getAdoptedSchemes() {
        return adoptedSchemes;
    }

    public void setAdoptedSchemes(List<Scheme> adoptedSchemes) {
        this.adoptedSchemes = adoptedSchemes;
    }
}
