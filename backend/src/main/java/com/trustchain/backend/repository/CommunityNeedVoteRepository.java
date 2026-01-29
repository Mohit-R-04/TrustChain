package com.trustchain.backend.repository;

import com.trustchain.backend.model.CommunityNeedVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityNeedVoteRepository extends JpaRepository<CommunityNeedVote, UUID> {
    Optional<CommunityNeedVote> findByNeed_NeedIdAndVoter(UUID needId, String voter);
}

