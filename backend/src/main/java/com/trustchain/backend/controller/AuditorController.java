package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.Auditor;
import com.trustchain.backend.model.BlockchainEvent;
import com.trustchain.backend.model.Donation;
import com.trustchain.backend.model.InvoicePayout;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.repository.BlockchainEventRepository;
import com.trustchain.backend.repository.DonationRepository;
import com.trustchain.backend.repository.InvoicePayoutRepository;
import com.trustchain.backend.service.AuditorService;
import com.trustchain.backend.service.SchemeService;
import com.trustchain.backend.service.blockchain.BlockchainIdUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auditor")
public class AuditorController {

    @Autowired
    private AuditorService auditorService;

    @Autowired
    private SchemeService schemeService;

    @Autowired
    private BlockchainEventRepository blockchainEventRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private InvoicePayoutRepository invoicePayoutRepository;

    @GetMapping("/dashboard")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Auditor Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "AUDITOR");
        response.put("stats", Map.of(
                "pendingAudits", 0,
                "completedAudits", 0,
                "flaggedTransactions", 0));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/schemes/{schemeId}/audit-transactions")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, Object>> getSchemeAuditTransactions(@PathVariable UUID schemeId) {
        Optional<Scheme> schemeOpt = schemeService.getSchemeById(schemeId);
        if (schemeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Scheme scheme = schemeOpt.get();
        BigInteger schemeUint = BlockchainIdUtil.uuidToUint256(schemeId);
        String schemeKey = schemeUint.toString();

        List<Donation> donations = donationRepository.findByScheme_SchemeIdOrderByTimestampAsc(schemeId);
        List<InvoicePayout> payouts = invoicePayoutRepository.findBySchemeIdOrderByCreatedAtAsc(schemeId);

        List<BlockchainEvent> deposits = blockchainEventRepository
                .findBySchemeIdAndEventNameOrderByCreatedAtAsc(schemeKey, "FundsDeposited");
        List<BlockchainEvent> releasesDemo = blockchainEventRepository
                .findBySchemeIdAndEventNameOrderByCreatedAtAsc(schemeKey, "FundsReleased");
        List<BlockchainEvent> releasesChain = blockchainEventRepository
                .findBySchemeIdAndEventNameOrderByCreatedAtAsc(schemeKey, "PaymentReleased");
        List<BlockchainEvent> releases = new java.util.ArrayList<>();
        releases.addAll(releasesDemo);
        releases.addAll(releasesChain);
        releases.sort(java.util.Comparator.comparing(BlockchainEvent::getCreatedAt));

        Map<String, Object> out = new HashMap<>();
        out.put("schemeId", scheme.getSchemeId());
        out.put("schemeName", scheme.getSchemeName());
        List<Map<String, Object>> depositViews = new java.util.ArrayList<>();
        depositViews.addAll(donations.stream().map(this::toDonationAuditTxView).collect(Collectors.toList()));
        depositViews.addAll(deposits.stream().map(this::toAuditTxView).collect(Collectors.toList()));
        depositViews.sort(java.util.Comparator.comparing(m -> (String) m.get("createdAt"), java.util.Comparator.nullsLast(String::compareTo)));

        List<Map<String, Object>> releaseViews = new java.util.ArrayList<>();
        releaseViews.addAll(payouts.stream().map(this::toPayoutAuditTxView).collect(Collectors.toList()));
        releaseViews.addAll(releases.stream().map(this::toAuditTxView).collect(Collectors.toList()));
        releaseViews.sort(java.util.Comparator.comparing(m -> (String) m.get("createdAt"), java.util.Comparator.nullsLast(String::compareTo)));

        out.put("deposits", depositViews);
        out.put("releases", releaseViews);
        return ResponseEntity.ok(out);
    }

    private Map<String, Object> toAuditTxView(BlockchainEvent e) {
        Map<String, Object> out = new HashMap<>();
        out.put("eventName", e.getEventName());
        out.put("txHash", e.getTransactionHash());
        out.put("blockNumber", e.getBlockNumber());
        out.put("fromAddress", e.getFromAddress());
        out.put("toAddress", e.getVendorAddress() != null && !e.getVendorAddress().isBlank() ? e.getVendorAddress() : e.getContractAddress());
        out.put("amountWei", e.getAmountWei());
        out.put("invoiceId", e.getInvoiceId());
        out.put("ipfsCid", e.getIpfsHash());
        out.put("rootHash", e.getIpfsHash());
        out.put("createdAt", e.getCreatedAt() != null ? e.getCreatedAt().toString() : null);
        return out;
    }

    private Map<String, Object> toDonationAuditTxView(Donation d) {
        Map<String, Object> out = new HashMap<>();
        out.put("eventName", "DonationPayment");
        out.put("txHash", d.getTransactionRef());
        out.put("fromAddress", d.getDonor() != null ? d.getDonor().getUserId() : (d.getGovernment() != null ? d.getGovernment().getUserId() : null));
        out.put("toAddress", "wallet");
        out.put("amountInr", d.getAmount());
        out.put("currency", "INR");
        out.put("donationId", d.getDonationId() != null ? d.getDonationId().toString() : null);
        out.put("ipfsCid", d.getIpfsCid());
        out.put("rootHash", d.getIpfsCid());
        out.put("createdAt", d.getTimestamp() != null ? d.getTimestamp().toString() : null);
        return out;
    }

    private Map<String, Object> toPayoutAuditTxView(InvoicePayout p) {
        Map<String, Object> out = new HashMap<>();
        out.put("eventName", "InvoicePayout");
        out.put("txHash", p.getTransactionHash());
        out.put("fromAddress", p.getFromAddress());
        out.put("toAddress", p.getToAddress());
        out.put("amountInr", p.getAmountInr());
        out.put("amountWei", p.getAmountWei());
        out.put("invoiceId", p.getInvoiceId() != null ? p.getInvoiceId().toString() : null);
        out.put("ipfsCid", p.getIpfsCid());
        out.put("rootHash", p.getIpfsCid());
        out.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        return out;
    }

    @PostMapping("/audits")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, String>> startAudit(
            @RequestBody Map<String, Object> auditData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Audit started successfully");
        response.put("auditorId", authentication.getName());
        response.put("status", "in_progress");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/flag")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, String>> flagTransaction(
            @RequestBody Map<String, Object> flagData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Transaction flagged successfully");
        response.put("auditorId", authentication.getName());
        response.put("status", "flagged");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    @RequireRole(UserRole.AUDITOR)
    public ResponseEntity<Map<String, Object>> getAuditReports(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", authentication.getName());
        response.put("reports", new Object[] {});
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Auditor> getAuditorByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(auditorService.getAuditorByUserId(userId));
    }

    // CRUD Endpoints
    @GetMapping
    public ResponseEntity<List<Auditor>> getAllAuditors() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auditor> getAuditorById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Auditor> createAuditor(@RequestBody Auditor auditor) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Auditor> updateAuditor(@PathVariable UUID id, @RequestBody Auditor auditor) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditor(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
