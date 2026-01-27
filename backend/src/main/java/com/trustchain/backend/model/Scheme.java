package com.trustchain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "scheme")
public class Scheme {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "scheme_id")
    private UUID schemeId;

    @Column(name = "scheme_name")
    private String schemeName;

    @Column(name = "budget")
    private Double budget;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_finished")
    private Boolean isFinished;

    @ManyToOne
    @JoinColumn(name = "govt_id", referencedColumnName = "govt_id")
    private Government government;

    // Constructors
    public Scheme() {
    }

    public Scheme(String schemeName, Double budget, LocalDate startDate, LocalDate endDate, Boolean isFinished) {
        this.schemeName = schemeName;
        this.budget = budget;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isFinished = isFinished;
    }

    // Getters and Setters
    public UUID getSchemeId() {
        return schemeId;
    }

    public void setSchemeId(UUID schemeId) {
        this.schemeId = schemeId;
    }

    public String getSchemeName() {
        return schemeName;
    }

    public void setSchemeName(String schemeName) {
        this.schemeName = schemeName;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsFinished() {
        return isFinished;
    }

    public void setIsFinished(Boolean isFinished) {
        this.isFinished = isFinished;
    }

    public Government getGovernment() {
        return government;
    }

    public void setGovernment(Government government) {
        this.government = government;
    }
}
