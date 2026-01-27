package com.trustchain.backend.service;

import com.trustchain.backend.model.Ngo;
import com.trustchain.backend.repository.NgoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NgoService {

    @Autowired
    private NgoRepository ngoRepository;

    public List<Ngo> getAllNgos() {
        // TODO: Implement method
        return null;
    }

    public Optional<Ngo> getNgoById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Ngo createNgo(Ngo ngo) {
        // TODO: Implement method
        return null;
    }

    public Ngo updateNgo(UUID id, Ngo ngo) {
        // TODO: Implement method
        return null;
    }

    public void deleteNgo(UUID id) {
        // TODO: Implement method
    }
}
