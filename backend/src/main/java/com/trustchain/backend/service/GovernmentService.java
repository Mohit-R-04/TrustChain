package com.trustchain.backend.service;

import com.trustchain.backend.model.Government;
import com.trustchain.backend.repository.GovernmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class GovernmentService {

    @Autowired
    private GovernmentRepository governmentRepository;

    public List<Government> getAllGovernments() {
        // TODO: Implement method
        return null;
    }

    public Optional<Government> getGovernmentById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Government createGovernment(Government government) {
        // TODO: Implement method
        return null;
    }

    public Government updateGovernment(UUID id, Government government) {
        // TODO: Implement method
        return null;
    }

    public void deleteGovernment(UUID id) {
        // TODO: Implement method
    }
}
