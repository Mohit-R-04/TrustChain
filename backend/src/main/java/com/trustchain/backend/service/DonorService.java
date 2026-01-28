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
        return donorRepository.findAll();
    }

    public Optional<Donor> getDonorById(UUID id) {
        return donorRepository.findById(id);
    }

    public Donor createDonor(Donor donor) {
        return donorRepository.save(donor);
    }

    public Donor updateDonor(UUID id, Donor donor) {
        if (donorRepository.existsById(id)) {
            donor.setDonorId(id);
            return donorRepository.save(donor);
        }
        return null;
    }

    public void deleteDonor(UUID id) {
        donorRepository.deleteById(id);
    }
}
