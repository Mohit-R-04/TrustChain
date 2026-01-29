package com.trustchain.backend.repository;

import com.trustchain.backend.model.CommunityNeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommunityNeedRepository extends JpaRepository<CommunityNeed, UUID> {
    List<CommunityNeed> findAllByOrderByCreatedAtDesc();
}
