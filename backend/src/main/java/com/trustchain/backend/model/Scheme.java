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

    @Column(name = "category")
    private String category;

    @Column(name = "region")
    private String region;

    @Column(name = "expected_beneficiaries")
    private Integer expectedBeneficiaries;

    @Column(name = "milestone_count")
    private Integer milestoneCount;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "govt_id", referencedColumnName = "govt_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"schemes", "hibernateLazyInitializer", "handler"})
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
        this.createdAt = java.time.LocalDateTime.now();
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Integer getExpectedBeneficiaries() {
        return expectedBeneficiaries;
    }

    public void setExpectedBeneficiaries(Integer expectedBeneficiaries) {
        this.expectedBeneficiaries = expectedBeneficiaries;
    }

    public Integer getMilestoneCount() {
        return milestoneCount;
    }

    public void setMilestoneCount(Integer milestoneCount) {
        this.milestoneCount = milestoneCount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Government getGovernment() {
        return government;
    }

    public void setGovernment(Government government) {
        this.government = government;
    }
}
