package com.trustchain.backend.repository;

import com.trustchain.backend.model.NgoVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NgoVendorRepository extends JpaRepository<NgoVendor, UUID> {
}
