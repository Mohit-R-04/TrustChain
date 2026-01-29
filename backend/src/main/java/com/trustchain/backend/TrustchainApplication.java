package com.trustchain.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrustchainApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrustchainApplication.class, args);
	}

}
