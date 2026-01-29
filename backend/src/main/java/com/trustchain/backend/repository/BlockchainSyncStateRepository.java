package com.trustchain.backend.repository;

import com.trustchain.backend.model.BlockchainSyncState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockchainSyncStateRepository extends JpaRepository<BlockchainSyncState, String> {
}
