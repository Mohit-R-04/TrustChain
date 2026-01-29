package com.trustchain.backend.repository;

import com.trustchain.backend.model.DemoEscrowState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemoEscrowStateRepository extends JpaRepository<DemoEscrowState, String> {
}
