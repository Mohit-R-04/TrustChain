package com.trustchain.backend.repository;

import com.trustchain.backend.model.InvoicePayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoicePayoutRepository extends JpaRepository<InvoicePayout, UUID> {
    Optional<InvoicePayout> findTopByInvoiceIdOrderByCreatedAtDesc(UUID invoiceId);
}
