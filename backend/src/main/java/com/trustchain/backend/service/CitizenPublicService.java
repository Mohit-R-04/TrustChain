package com.trustchain.backend.service;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.repository.BlockchainEventRepository;
import com.trustchain.backend.repository.DonationRepository;
import com.trustchain.backend.repository.SchemeRepository;
import com.trustchain.backend.service.blockchain.DemoEscrowLedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CitizenPublicService {

    private static final BigDecimal WEI_PER_INR = new BigDecimal("100000000000");

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private BlockchainEventRepository blockchainEventRepository;

    @Autowired(required = false)
    private BlockchainProperties blockchainProperties;

    @Autowired(required = false)
    private DemoEscrowLedgerService demoLedger;

    public Map<String, Object> getTransparencyData() {
        List<Scheme> schemes = schemeRepository.findAll();
        double donationTotal = safeDouble(donationRepository.sumAllAmounts());
        double budgetTotal = schemes.stream().mapToDouble(s -> safeDouble(s.getBudget())).sum();
        double totalFunds = donationTotal > 0 ? donationTotal : budgetTotal;

        BigDecimal escrowInr = getEscrowBalanceInr();
        double utilizedInr = Math.max(donationTotal - escrowInr.doubleValue(), 0d);
        double utilizationRate = donationTotal > 0 ? (utilizedInr / donationTotal) * 100d : 0d;

        long verifiedTransactions = blockchainEventRepository.count();

        Map<String, Object> response = new HashMap<>();
        response.put("totalFundsInr", round2(totalFunds));
        response.put("projects", schemes.size());
        response.put("transactionsVerified", verifiedTransactions);
        response.put("utilizationRate", round2(utilizationRate));
        response.put("escrowInr", round2(escrowInr.doubleValue()));
        response.put("utilizedInr", round2(utilizedInr));
        response.put("categoryDistribution", getCategoryDistribution(schemes, donationTotal));
        return response;
    }

    public Map<String, Object> getPublicProjects() {
        List<Scheme> schemes = schemeRepository.findAll();
        List<Map<String, Object>> projects = schemes.stream()
                .sorted(Comparator.comparing(Scheme::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toPublicProject)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("projects", projects);
        response.put("total", projects.size());
        return response;
    }

    private Map<String, Object> toPublicProject(Scheme scheme) {
        UUID schemeId = scheme.getSchemeId();
        double donatedToScheme = safeDouble(donationRepository.sumAmountsBySchemeId(schemeId));
        long donors = donationRepository.countDistinctDonorUsersBySchemeId(schemeId)
                + donationRepository.countDistinctGovernmentUsersBySchemeId(schemeId);

        double progress = 0d;
        if (donatedToScheme > 0) {
            BigDecimal schemeEscrowInr = getSchemeEscrowInr(schemeId);
            double utilizedToScheme = Math.max(donatedToScheme - schemeEscrowInr.doubleValue(), 0d);
            progress = (utilizedToScheme / donatedToScheme) * 100d;
        }
        if (Double.isNaN(progress) || Double.isInfinite(progress)) progress = 0d;
        progress = Math.max(0d, Math.min(100d, progress));

        Map<String, Object> out = new HashMap<>();
        out.put("id", schemeId.toString());
        out.put("title", scheme.getSchemeName());
        out.put("location", scheme.getRegion());
        out.put("category", scheme.getCategory());
        out.put("progress", Math.round(progress));
        out.put("amountInr", round2(donatedToScheme > 0 ? donatedToScheme : safeDouble(scheme.getBudget())));
        out.put("donors", donors);
        out.put("description", scheme.getDescription());
        return out;
    }

    private List<Map<String, Object>> getCategoryDistribution(List<Scheme> schemes, double donationTotal) {
        Map<String, Double> categoryTotals = new HashMap<>();
        if (donationTotal > 0) {
            for (Object[] row : donationRepository.sumDonationsByCategory()) {
                String category = row[0] != null ? row[0].toString() : "Other";
                double amount = row[1] != null ? ((Number) row[1]).doubleValue() : 0d;
                categoryTotals.merge(category, amount, Double::sum);
            }
        } else {
            for (Scheme s : schemes) {
                String category = s.getCategory() != null && !s.getCategory().isBlank() ? s.getCategory() : "Other";
                categoryTotals.merge(category, safeDouble(s.getBudget()), Double::sum);
            }
        }

        double total = donationTotal > 0 ? donationTotal : categoryTotals.values().stream().mapToDouble(Double::doubleValue).sum();
        if (total <= 0) {
            return List.of();
        }

        return categoryTotals.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("category", e.getKey());
                    m.put("percent", round2((e.getValue() / total) * 100d));
                    return m;
                })
                .collect(Collectors.toList());
    }

    private BigDecimal getEscrowBalanceInr() {
        if (blockchainProperties == null || !blockchainProperties.isEnabled() || !blockchainProperties.isDemoMode() || demoLedger == null) {
            return BigDecimal.ZERO;
        }
        BigInteger wei = demoLedger.getContractBalanceWei();
        return new BigDecimal(wei).divide(WEI_PER_INR, 2, RoundingMode.DOWN);
    }

    private BigDecimal getSchemeEscrowInr(UUID schemeId) {
        if (blockchainProperties == null || !blockchainProperties.isEnabled() || !blockchainProperties.isDemoMode() || demoLedger == null) {
            return BigDecimal.ZERO;
        }
        BigInteger wei = demoLedger.getSchemeBalanceWei(schemeId, com.trustchain.backend.service.blockchain.BlockchainIdUtil.uuidToUint256(schemeId));
        return new BigDecimal(wei).divide(WEI_PER_INR, 2, RoundingMode.DOWN);
    }

    private static double safeDouble(Double v) {
        return v != null ? v : 0d;
    }

    private static double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
