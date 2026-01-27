package com.trustchain.backend.service;

import com.trustchain.backend.model.Donor;
import com.trustchain.backend.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DonorService {

    @Autowired
    private DonorRepository donorRepository;

    public List<Donor> getAllDonors() {
        // TODO: Implement method
        return null;
    }

    public Optional<Donor> getDonorById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Donor createDonor(Donor donor) {
        // TODO: Implement method
        return null;
    }

    public Donor updateDonor(UUID id, Donor donor) {
        // TODO: Implement method
        return null;
    }

    public void deleteDonor(UUID id) {
        // TODO: Implement method
    }
}
