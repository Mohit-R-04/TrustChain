package com.trustchain.backend.repository;

import com.trustchain.backend.model.Auditor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditorRepository extends JpaRepository<Auditor, UUID> {
    Optional<Auditor> findByUserId(String userId);

    Optional<Auditor> findByEmail(String email);
}
