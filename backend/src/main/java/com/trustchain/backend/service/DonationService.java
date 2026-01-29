package com.trustchain.backend.service;

import com.trustchain.backend.dto.DonationRequest;
import com.trustchain.backend.model.Donation;
import com.trustchain.backend.model.Donor;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.repository.DonationRepository;
import com.trustchain.backend.repository.DonorRepository;
import com.trustchain.backend.repository.SchemeRepository;
import com.trustchain.backend.service.blockchain.BlockchainIdUtil;
import com.trustchain.backend.service.blockchain.DemoEscrowLedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import java.util.Map;
import java.util.HashMap;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired(required = false)
    private BlockchainProperties blockchainProperties;

    @Autowired(required = false)
    private DemoEscrowLedgerService demoLedger;

    public Map<String, Object> getDonorStats(String donorAuthId) {
        List<Donation> donations = donationRepository.findByDonor_UserId(donorAuthId);
        double totalDonations = donations.stream().mapToDouble(Donation::getAmount).sum();
        long activeProjects = donations.stream().map(Donation::getScheme).distinct().count();
        // Assuming verified if transactionRef is present (which is always true for now)
        long verifiedTransactions = donations.size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDonations", totalDonations);
        stats.put("activeProjects", activeProjects);
        stats.put("verifiedTransactions", verifiedTransactions);
        return stats;
    }

    public List<Donation> getDonationsByUserId(String userId) {
        return donationRepository.findByDonor_UserId(userId);
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Optional<Donation> getDonationById(UUID id) {
        return donationRepository.findById(id);
    }

    @Transactional
    public Donation processDonation(DonationRequest request, String donorAuthId) {
        Scheme scheme = null;
        if (request.getSchemeId() != null) {
            scheme = schemeRepository.findById(request.getSchemeId()).orElse(null);
        }
        if (scheme == null && request.getSchemeName() != null) {
            java.util.List<Scheme> matches = schemeRepository.findAllBySchemeName(request.getSchemeName());
            if (matches != null && !matches.isEmpty()) {
                scheme = matches.get(0);
            }
        }
        if (scheme == null) {
            throw new RuntimeException("Scheme not found");
        }

        // Ensure donor exists
        Donor donor = donorRepository.findByUserId(donorAuthId)
                .orElseGet(() -> {
                    Donor newDonor = new Donor();
                    newDonor.setUserId(donorAuthId);
                    newDonor.setName("Donor " + donorAuthId.substring(0, 5)); // Placeholder name
                    newDonor.setEmail("donor@example.com"); // Placeholder
                    return donorRepository.save(newDonor);
                });

        // Simulate payment
        boolean paymentSuccess = paymentService.processPayment(request.getAmount(), "INR", request.getPaymentToken());
        if (!paymentSuccess) {
            throw new RuntimeException("Payment failed");
        }

        Donation donation = new Donation();
        donation.setScheme(scheme);
        donation.setDonor(donor);
        donation.setAmount(request.getAmount());
        donation.setTimestamp(java.time.LocalDateTime.now());
        donation.setTransactionRef(paymentService.generateTransactionReference());
        donation.setStatus("COMPLETED");
        Donation saved = donationRepository.save(donation);

        if (blockchainProperties != null && blockchainProperties.isEnabled() && blockchainProperties.isDemoMode() && demoLedger != null) {
            BigDecimal inr = BigDecimal.valueOf(request.getAmount() != null ? request.getAmount() : 0d);
            if (inr.signum() > 0) {
                BigInteger amountWei = inr.multiply(new BigDecimal("100000000000")).toBigInteger();
                BigInteger schemeId = BlockchainIdUtil.uuidToUint256(scheme.getSchemeId());
                demoLedger.recordDeposit(scheme.getSchemeId(), schemeId, "0x0000000000000000000000000000000000000000", amountWei);
            }
        }

        return saved;
    }

    public Donation createDonation(Donation donation) {
        return donationRepository.save(donation);
    }

    public Donation updateDonation(UUID id, Donation donation) {
        if (donationRepository.existsById(id)) {
            donation.setDonationId(id);
            return donationRepository.save(donation);
        }
        return null;
    }

    public void deleteDonation(UUID id) {
        donationRepository.deleteById(id);
    }
}
