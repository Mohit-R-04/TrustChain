package com.trustchain.backend.repository;

import com.trustchain.backend.model.Government;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.model.StateSchemeAcceptance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StateSchemeAcceptanceRepository extends JpaRepository<StateSchemeAcceptance, UUID> {
    List<StateSchemeAcceptance> findByGovernment(Government government);
    Optional<StateSchemeAcceptance> findByGovernmentAndScheme(Government government, Scheme scheme);
}
