package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "manage")
public class Manage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "manage_id")
    private UUID manageId;

    @ManyToOne
    @JoinColumn(name = "ngo_id", referencedColumnName = "ngo_id")
    private Ngo ngo;

    @ManyToOne
    @JoinColumn(name = "scheme_id", referencedColumnName = "scheme_id")
    private Scheme scheme;

    // Constructors
    public Manage() {
    }

    public Manage(Ngo ngo, Scheme scheme) {
        this.ngo = ngo;
        this.scheme = scheme;
    }

    // Getters and Setters
    public UUID getManageId() {
        return manageId;
    }

    public void setManageId(UUID manageId) {
        this.manageId = manageId;
    }

    public Ngo getNgo() {
        return ngo;
    }

    public void setNgo(Ngo ngo) {
        this.ngo = ngo;
    }

    public Scheme getScheme() {
        return scheme;
    }

    public void setScheme(Scheme scheme) {
        this.scheme = scheme;
    }
}
