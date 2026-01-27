package com.trustchain.backend.repository;

import com.trustchain.backend.model.KycRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KycRecordRepository extends JpaRepository<KycRecord, Long> {

    Optional<KycRecord> findByAadhaarNumber(String aadhaarNumber);

    boolean existsByAadhaarNumber(String aadhaarNumber);

    Optional<KycRecord> findByVendorId(String vendorId);

    boolean existsByVendorId(String vendorId);
}
