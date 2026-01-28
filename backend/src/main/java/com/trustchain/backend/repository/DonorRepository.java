package com.trustchain.backend.repository;

import com.trustchain.backend.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DonorRepository extends JpaRepository<Donor, UUID> {
    Optional<Donor> findByAuthId(String authId);
}
