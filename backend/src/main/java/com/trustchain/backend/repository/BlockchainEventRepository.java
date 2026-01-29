package com.trustchain.backend.repository;

import com.trustchain.backend.model.BlockchainEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlockchainEventRepository extends JpaRepository<BlockchainEvent, UUID> {
    List<BlockchainEvent> findTop50ByOrderByBlockNumberDesc();
    List<BlockchainEvent> findTop50ByOrderByCreatedAtDesc();
    boolean existsByTransactionHashAndEventNameAndBlockNumber(String transactionHash, String eventName, Long blockNumber);
}
