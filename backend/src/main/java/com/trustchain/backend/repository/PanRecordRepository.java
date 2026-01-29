package com.trustchain.backend.repository;

import com.trustchain.backend.model.PanRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanRecordRepository extends JpaRepository<PanRecord, Long> {

    Optional<PanRecord> findByPanNumber(String panNumber);

    boolean existsByPanNumber(String panNumber);

    Optional<PanRecord> findByVendorId(String vendorId);

    boolean existsByVendorId(String vendorId);

    boolean existsByVendorIdAndStatus(String vendorId, PanRecord.VerificationStatus status);
}
