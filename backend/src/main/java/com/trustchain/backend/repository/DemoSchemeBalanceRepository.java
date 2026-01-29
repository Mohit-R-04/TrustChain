package com.trustchain.backend.repository;

import com.trustchain.backend.model.DemoSchemeBalance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemoSchemeBalanceRepository extends JpaRepository<DemoSchemeBalance, String> {
}
