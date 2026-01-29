package com.trustchain.backend.repository;

import com.trustchain.backend.model.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchemeRepository extends JpaRepository<Scheme, UUID> {
    Optional<Scheme> findBySchemeName(String schemeName);
    List<Scheme> findAllBySchemeName(String schemeName);
    List<Scheme> findByCategory(String category);
}
