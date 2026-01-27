package com.trustchain.backend.service;

import com.trustchain.backend.model.Donation;
import com.trustchain.backend.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    public List<Donation> getAllDonations() {
        // TODO: Implement method
        return null;
    }

    public Optional<Donation> getDonationById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Donation createDonation(Donation donation) {
        // TODO: Implement method
        return null;
    }

    public Donation updateDonation(UUID id, Donation donation) {
        // TODO: Implement method
        return null;
    }

    public void deleteDonation(UUID id) {
        // TODO: Implement method
    }
}
