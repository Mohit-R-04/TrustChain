package com.trustchain.backend.controller;

import com.trustchain.backend.service.TrustChainEscrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.web3j.crypto.Credentials;

import java.math.BigInteger;

/**
 * REST API Controller for TrustChain Escrow operations
 */
@RestController
@RequestMapping("/api/escrow")
@CrossOrigin(origins = "*")
public class EscrowController {
    
    @Autowired
    private TrustChainEscrowService escrowService;
    
    // ========== READ OPERATIONS (No auth needed for blockchain reads) ==========
    
    /**
     * GET /api/escrow/milestone/{schemeId}/{milestoneId}
     * Get milestone details
     */
    @GetMapping("/milestone/{schemeId}/{milestoneId}")
    public ResponseEntity<?> getMilestone(
        @PathVariable Long schemeId,
        @PathVariable Long milestoneId
    ) {
        try {
            TrustChainEscrowService.Milestone milestone = escrowService.getMilestone(
                BigInteger.valueOf(schemeId),
                BigInteger.valueOf(milestoneId)
            );
            return ResponseEntity.ok(milestone);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/escrow/scheme/{schemeId}/balance
     * Get scheme balance
     */
    @GetMapping("/scheme/{schemeId}/balance")
    public ResponseEntity<?> getSchemeBalance(@PathVariable Long schemeId) {
        try {
            BigInteger balance = escrowService.getSchemeBalance(BigInteger.valueOf(schemeId));
            return ResponseEntity.ok(new BalanceResponse(balance.toString()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/escrow/scheme/{schemeId}/donor/{address}
     * Get donor contribution
     */
    @GetMapping("/scheme/{schemeId}/donor/{address}")
    public ResponseEntity<?> getDonorContribution(
        @PathVariable Long schemeId,
        @PathVariable String address
    ) {
        try {
            BigInteger contribution = escrowService.getDonorContribution(
                BigInteger.valueOf(schemeId),
                address
            );
            return ResponseEntity.ok(new BalanceResponse(contribution.toString()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * GET /api/escrow/proof/{schemeId}/{milestoneId}
     * Get proof record
     */
    @GetMapping("/proof/{schemeId}/{milestoneId}")
    public ResponseEntity<?> getProof(
        @PathVariable Long schemeId,
        @PathVariable Long milestoneId
    ) {
        try {
            TrustChainEscrowService.ProofRecord proof = escrowService.getProof(
                BigInteger.valueOf(schemeId),
                BigInteger.valueOf(milestoneId)
            );
            return ResponseEntity.ok(proof);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // ========== WRITE OPERATIONS (Require private key) ==========
    
    /**
     * POST /api/escrow/scheme/create
     * Create new scheme (Owner only)
     */
    @PostMapping("/scheme/create")
    public ResponseEntity<?> createScheme(@RequestBody CreateSchemeRequest request) {
        try {
            Credentials credentials = Credentials.create(request.privateKey);
            String txHash = escrowService.createScheme(
                BigInteger.valueOf(request.schemeId),
                credentials
            );
            return ResponseEntity.ok(new TransactionResponse(txHash));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * POST /api/escrow/deposit
     * Deposit funds to scheme
     */
    @PostMapping("/deposit")
    public ResponseEntity<?> depositFunds(@RequestBody DepositRequest request) {
        try {
            Credentials credentials = Credentials.create(request.privateKey);
            String txHash = escrowService.depositFunds(
                BigInteger.valueOf(request.schemeId),
                new BigInteger(request.amountInWei),
                credentials
            );
            return ResponseEntity.ok(new TransactionResponse(txHash));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * POST /api/escrow/milestone/create
     * Create milestone (Owner only)
     */
    @PostMapping("/milestone/create")
    public ResponseEntity<?> createMilestone(@RequestBody CreateMilestoneRequest request) {
        try {
            Credentials credentials = Credentials.create(request.privateKey);
            String txHash = escrowService.createMilestone(
                BigInteger.valueOf(request.schemeId),
                BigInteger.valueOf(request.milestoneId),
                new BigInteger(request.amount),
                credentials
            );
            return ResponseEntity.ok(new TransactionResponse(txHash));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * POST /api/escrow/proof/submit
     * Submit proof (Vendor only)
     */
    @PostMapping("/proof/submit")
    public ResponseEntity<?> submitProof(@RequestBody SubmitProofRequest request) {
        try {
            Credentials credentials = Credentials.create(request.privateKey);
            String txHash = escrowService.submitProof(
                BigInteger.valueOf(request.schemeId),
                BigInteger.valueOf(request.milestoneId),
                request.ipfsHash,
                credentials
            );
            return ResponseEntity.ok(new TransactionResponse(txHash));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * POST /api/escrow/proof/approve
     * Approve proof (Owner only)
     */
    @PostMapping("/proof/approve")
    public ResponseEntity<?> approveProof(@RequestBody ApproveProofRequest request) {
        try {
            Credentials credentials = Credentials.create(request.privateKey);
            String txHash = escrowService.approveProof(
                BigInteger.valueOf(request.schemeId),
                BigInteger.valueOf(request.milestoneId),
                credentials
            );
            return ResponseEntity.ok(new TransactionResponse(txHash));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * POST /api/escrow/payment/release
     * Release payment (Owner only)
     */
    @PostMapping("/payment/release")
    public ResponseEntity<?> releasePayment(@RequestBody ReleasePaymentRequest request) {
        try {
            Credentials credentials = Credentials.create(request.privateKey);
            String txHash = escrowService.releasePayment(
                BigInteger.valueOf(request.schemeId),
                BigInteger.valueOf(request.milestoneId),
                credentials
            );
            return ResponseEntity.ok(new TransactionResponse(txHash));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // ========== REQUEST/RESPONSE CLASSES ==========
    
    static class CreateSchemeRequest {
        public Long schemeId;
        public String privateKey;
    }
    
    static class DepositRequest {
        public Long schemeId;
        public String amountInWei;
        public String privateKey;
    }
    
    static class CreateMilestoneRequest {
        public Long schemeId;
        public Long milestoneId;
        public String amount;
        public String privateKey;
    }
    
    static class SubmitProofRequest {
        public Long schemeId;
        public Long milestoneId;
        public String ipfsHash;
        public String privateKey;
    }
    
    static class ApproveProofRequest {
        public Long schemeId;
        public Long milestoneId;
        public String privateKey;
    }
    
    static class ReleasePaymentRequest {
        public Long schemeId;
        public Long milestoneId;
        public String privateKey;
    }
    
    static class TransactionResponse {
        public String transactionHash;
        public TransactionResponse(String txHash) {
            this.transactionHash = txHash;
        }
    }
    
    static class BalanceResponse {
        public String balance;
        public BalanceResponse(String balance) {
            this.balance = balance;
        }
    }
}
