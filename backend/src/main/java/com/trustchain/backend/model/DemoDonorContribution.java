package com.trustchain.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "demo_donor_contribution")
public class DemoDonorContribution {
    @Id
    @Column(name = "contribution_key", length = 150)
    private String contributionKey;

    @Column(name = "scheme_uuid", length = 60)
    private String schemeUuid;

    @Column(name = "scheme_id", length = 90)
    private String schemeId;

    @Column(name = "donor_address", length = 80)
    private String donorAddress;

    @Column(name = "amount_wei", length = 120)
    private String amountWei;

    public String getContributionKey() {
        return contributionKey;
    }

    public void setContributionKey(String contributionKey) {
        this.contributionKey = contributionKey;
    }

    public String getSchemeUuid() {
        return schemeUuid;
    }

    public void setSchemeUuid(String schemeUuid) {
        this.schemeUuid = schemeUuid;
    }

    public String getSchemeId() {
        return schemeId;
    }

    public void setSchemeId(String schemeId) {
        this.schemeId = schemeId;
    }

    public String getDonorAddress() {
        return donorAddress;
    }

    public void setDonorAddress(String donorAddress) {
        this.donorAddress = donorAddress;
    }

    public String getAmountWei() {
        return amountWei;
    }

    public void setAmountWei(String amountWei) {
        this.amountWei = amountWei;
    }
}
