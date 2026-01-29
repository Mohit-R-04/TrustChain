package com.trustchain.backend.repository;

import com.trustchain.backend.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findTopByEmailOrderByCreatedAtDesc(String email);

    Optional<OtpToken> findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(String email);

    Optional<OtpToken> findTopByEmailAndVerificationTokenOrderByCreatedAtDesc(String email, String verificationToken);
}

