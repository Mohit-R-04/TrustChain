package com.trustchain.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "demo_escrow_state")
public class DemoEscrowState {
    @Id
    @Column(name = "state_key", length = 60)
    private String stateKey;

    @Column(name = "contract_balance_wei", length = 120)
    private String contractBalanceWei;

    public String getStateKey() {
        return stateKey;
    }

    public void setStateKey(String stateKey) {
        this.stateKey = stateKey;
    }

    public String getContractBalanceWei() {
        return contractBalanceWei;
    }

    public void setContractBalanceWei(String contractBalanceWei) {
        this.contractBalanceWei = contractBalanceWei;
    }
}
