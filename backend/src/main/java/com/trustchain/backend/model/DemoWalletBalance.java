package com.trustchain.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "demo_wallet_balance")
public class DemoWalletBalance {
    @Id
    @Column(name = "address", length = 80)
    private String address;

    @Column(name = "balance_wei", length = 120)
    private String balanceWei;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBalanceWei() {
        return balanceWei;
    }

    public void setBalanceWei(String balanceWei) {
        this.balanceWei = balanceWei;
    }
}
