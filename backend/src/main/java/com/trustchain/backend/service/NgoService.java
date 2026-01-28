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
        return ngoRepository.findAll();
    }

    public Optional<Ngo> getNgoById(UUID id) {
        return ngoRepository.findById(id);
    }
    
    public Optional<Ngo> getNgoByUserId(String userId) {
        return ngoRepository.findByUserId(userId);
    }

    public Ngo createNgo(Ngo ngo) {
        return ngoRepository.save(ngo);
    }

    public Ngo updateNgo(UUID id, Ngo ngo) {
        return ngoRepository.findById(id).map(existingNgo -> {
            existingNgo.setName(ngo.getName());
            existingNgo.setEmail(ngo.getEmail());
            // Update other fields
            return ngoRepository.save(existingNgo);
        }).orElse(null);
    }

    public void deleteNgo(UUID id) {
        ngoRepository.deleteById(id);
    }
}
