package com.trustchain.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "blockchain_sync_state")
public class BlockchainSyncState {
    @Id
    @Column(name = "sync_key", length = 100)
    private String syncKey;

    @Column(name = "last_processed_block")
    private Long lastProcessedBlock;

    public String getSyncKey() {
        return syncKey;
    }

    public void setSyncKey(String syncKey) {
        this.syncKey = syncKey;
    }

    public Long getLastProcessedBlock() {
        return lastProcessedBlock;
    }

    public void setLastProcessedBlock(Long lastProcessedBlock) {
        this.lastProcessedBlock = lastProcessedBlock;
    }
}
