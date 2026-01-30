package com.trustchain.backend.repository;

import com.trustchain.backend.model.DemoWalletBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemoWalletBalanceRepository extends JpaRepository<DemoWalletBalance, String> {
}
