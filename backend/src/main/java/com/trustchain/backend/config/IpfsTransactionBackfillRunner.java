package com.trustchain.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.trustchain.backend.service.IpfsTransactionBackfillService;

import java.util.Map;

@Component
public class IpfsTransactionBackfillRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(IpfsTransactionBackfillRunner.class);
    private static final int DEFAULT_MAX_ITERATIONS = 50;

    public IpfsTransactionBackfillRunner(
            IpfsTransactionBackfillService backfillService
    ) {
        this.backfillService = backfillService;
    }

    private final IpfsTransactionBackfillService backfillService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!args.containsOption("trustchain.backfill.ipfs")) {
            return;
        }

        Map<String, Object> result = backfillService.backfill(DEFAULT_MAX_ITERATIONS);
        log.info("IPFS transaction backfill done. {}", result);
    }
}
