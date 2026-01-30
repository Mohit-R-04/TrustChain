package com.trustchain.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "trustchain.invoice.cid.secret=test-secret")
class TrustchainApplicationTests {

	@Test
	void contextLoads() {
	}

}
