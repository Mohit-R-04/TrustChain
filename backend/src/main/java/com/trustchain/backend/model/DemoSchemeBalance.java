package com.trustchain.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "demo_scheme_balance")
public class DemoSchemeBalance {
    @Id
    @Column(name = "scheme_uuid", length = 60)
    private String schemeUuid;

    @Column(name = "scheme_id", length = 90)
    private String schemeId;

    @Column(name = "balance_wei", length = 120)
    private String balanceWei;

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

    public String getBalanceWei() {
        return balanceWei;
    }

    public void setBalanceWei(String balanceWei) {
        this.balanceWei = balanceWei;
    }
}
