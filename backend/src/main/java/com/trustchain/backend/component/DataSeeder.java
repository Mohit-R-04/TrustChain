package com.trustchain.backend.component;

import com.trustchain.backend.model.Government;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.repository.GovernmentRepository;
import com.trustchain.backend.repository.SchemeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private GovernmentRepository governmentRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Ensure Government exists
        Government govt;
        if (governmentRepository.count() == 0) {
            govt = new Government("Govt of India", "password123");
            govt = governmentRepository.save(govt);
            System.out.println("Created default Government: " + govt.getGovtName());
        } else {
            govt = governmentRepository.findAll().get(0);
        }

        // Seed Schemes with specific UUIDs to match Frontend hardcoding
        seedScheme(java.util.UUID.fromString("11111111-1111-1111-1111-111111111111"), "Education for All", 1000000.0, govt);
        seedScheme(java.util.UUID.fromString("22222222-2222-2222-2222-222222222222"), "Clean Water Initiative", 500000.0, govt);
        seedScheme(java.util.UUID.fromString("33333333-3333-3333-3333-333333333333"), "Healthcare Support", 750000.0, govt);
    }

    private void seedScheme(java.util.UUID id, String name, Double budget, Government govt) {
        boolean existsById = schemeRepository.existsById(id);
        boolean existsByName = !schemeRepository.findAllBySchemeName(name).isEmpty();
        if (!existsById && !existsByName) {
            Scheme scheme = new Scheme(name, budget, LocalDate.now(), LocalDate.now().plusYears(1), false);
            scheme.setSchemeId(id);
            scheme.setGovernment(govt);
            schemeRepository.save(scheme);
            System.out.println("Seeded scheme: " + name + " with ID: " + id);
        }
    }
}
