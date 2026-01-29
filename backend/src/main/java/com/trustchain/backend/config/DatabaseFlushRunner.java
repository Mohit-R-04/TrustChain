package com.trustchain.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@ConditionalOnProperty(name = "trustchain.db.flush-on-start", havingValue = "true")
public class DatabaseFlushRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseFlushRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<String> tables = List.of(
                "audit_log",
                "donation",
                "receipt",
                "invoice",
                "ngo_vendor",
                "transaction",
                "community_need",
                "manage",
                "scheme",
                "blockchain_event",
                "demo_donor_contribution",
                "demo_scheme_balance",
                "demo_escrow_state",
                "kyc_records",
                "pan_records",
                "donor",
                "ngo",
                "vendor",
                "auditor",
                "government",
                "users"
        );

        for (String table : tables) {
            jdbcTemplate.execute("TRUNCATE TABLE " + table + " CASCADE");
        }
    }
}
