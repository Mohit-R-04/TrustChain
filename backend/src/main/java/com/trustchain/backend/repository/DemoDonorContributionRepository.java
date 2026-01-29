package com.trustchain.backend.repository;

import com.trustchain.backend.model.DemoDonorContribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DemoDonorContributionRepository extends JpaRepository<DemoDonorContribution, String> {
    Optional<DemoDonorContribution> findBySchemeUuidAndDonorAddress(String schemeUuid, String donorAddress);
}
