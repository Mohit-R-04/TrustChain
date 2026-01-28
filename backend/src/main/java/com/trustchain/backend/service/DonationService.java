package com.trustchain.backend.service;

import com.trustchain.backend.model.Donation;
import com.trustchain.backend.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.trustchain.backend.repository.SchemeRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private SchemeRepository schemeRepository;

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Optional<Donation> getDonationById(UUID id) {
        return donationRepository.findById(id);
    }

    public Donation createDonation(Donation donation) {
        Donation savedDonation = donationRepository.save(donation);
        
        // Update Scheme donated amount
        if (donation.getScheme() != null && donation.getScheme().getSchemeId() != null) {
            schemeRepository.findById(donation.getScheme().getSchemeId()).ifPresent(scheme -> {
                double currentDonated = scheme.getDonatedAmount() != null ? scheme.getDonatedAmount() : 0.0;
                scheme.setDonatedAmount(currentDonated + donation.getAmount());
                schemeRepository.save(scheme);
            });
        }
        
        return savedDonation;
    }

    public Donation updateDonation(UUID id, Donation donationDetails) {
        return donationRepository.findById(id).map(donation -> {
            donation.setAmount(donationDetails.getAmount());
            donation.setScheme(donationDetails.getScheme());
            donation.setDonor(donationDetails.getDonor());
            donation.setGovernment(donationDetails.getGovernment());
            donation.setTransactionRef(donationDetails.getTransactionRef());
            donation.setTimestamp(donationDetails.getTimestamp());
            return donationRepository.save(donation);
        }).orElseThrow(() -> new RuntimeException("Donation not found with id " + id));
    }

    public void deleteDonation(UUID id) {
        donationRepository.deleteById(id);
    }
}
