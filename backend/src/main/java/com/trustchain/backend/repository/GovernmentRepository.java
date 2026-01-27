package com.trustchain.backend.repository;

import com.trustchain.backend.model.Government;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GovernmentRepository extends JpaRepository<Government, UUID> {
}
