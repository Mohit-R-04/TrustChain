package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.model.BlockchainEvent;
import com.trustchain.backend.model.UserRole;
import com.trustchain.backend.repository.BlockchainEventRepository;
import com.trustchain.backend.service.blockchain.DemoEscrowLedgerService;
import com.trustchain.backend.service.blockchain.BlockchainIdUtil;
import com.trustchain.backend.service.blockchain.TrustChainEscrowClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/blockchain")
@ConditionalOnProperty(prefix = "blockchain", name = "enabled", havingValue = "true")
public class BlockchainController {

    @Autowired
    private BlockchainProperties properties;

    @Autowired(required = false)
    private TrustChainEscrowClient escrowClient;

    @Autowired
    private BlockchainEventRepository eventRepository;

    @Autowired
    private Web3j web3j;

    @Autowired(required = false)
    private DemoEscrowLedgerService demoLedger;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> out = new HashMap<>();
        out.put("enabled", properties.isEnabled());
        out.put("demoMode", properties.isDemoMode());
        out.put("rpcUrl", properties.getRpcUrl());
        out.put("chainId", properties.getChainId());
        out.put("contractAddress", properties.getContractAddress());
        out.put("backendSigner", escrowClient != null ? escrowClient.fromAddress() : null);
        out.put("signingEnabled", escrowClient != null);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/escrow/balance")
    public ResponseEntity<Map<String, Object>> escrowBalance() throws Exception {
        String contract = properties.getContractAddress();
        BigInteger balanceWei;
        if (properties.isDemoMode() && demoLedger != null) {
            balanceWei = demoLedger.getContractBalanceWei();
        } else {
            balanceWei = web3j.ethGetBalance(contract, DefaultBlockParameterName.LATEST).send().getBalance();
        }
        Map<String, Object> out = new HashMap<>();
        out.put("contractAddress", contract);
        out.put("balanceWei", balanceWei.toString());
        out.put("balancePol", new BigDecimal(balanceWei).movePointLeft(18).toPlainString());
        return ResponseEntity.ok(out);
    }

    @GetMapping("/schemes/{schemeUuid}/balance")
    public ResponseEntity<Map<String, Object>> schemeBalance(@PathVariable UUID schemeUuid) throws Exception {
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        if (properties.isDemoMode() && demoLedger != null) {
            BigInteger balanceWei = demoLedger.getSchemeBalanceWei(schemeUuid, schemeId);
            Map<String, Object> out = new HashMap<>();
            out.put("schemeUuid", schemeUuid.toString());
            out.put("schemeId", schemeId.toString());
            out.put("balanceWei", balanceWei.toString());
            out.put("balancePol", new BigDecimal(balanceWei).movePointLeft(18).toPlainString());
            return ResponseEntity.ok(out);
        }
        Function function = new Function(
                "getSchemeBalance",
                Collections.singletonList(new Uint256(schemeId)),
                Collections.singletonList(new TypeReference<Uint256>() {})
        );
        String data = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction("0x0000000000000000000000000000000000000000", properties.getContractAddress(), data),
                DefaultBlockParameterName.LATEST
        ).send();
        BigInteger balanceWei = ((Uint256) FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters()).get(0)).getValue();
        Map<String, Object> out = new HashMap<>();
        out.put("schemeUuid", schemeUuid.toString());
        out.put("schemeId", schemeId.toString());
        out.put("balanceWei", balanceWei.toString());
        out.put("balancePol", new BigDecimal(balanceWei).movePointLeft(18).toPlainString());
        return ResponseEntity.ok(out);
    }

    @RequireRole(UserRole.DONOR)
    @GetMapping("/schemes/{schemeUuid}/donors/{donorAddress}/contribution")
    public ResponseEntity<Map<String, Object>> donorContribution(@PathVariable UUID schemeUuid,
                                                                 @PathVariable String donorAddress) throws Exception {
        if (donorAddress == null || !donorAddress.startsWith("0x") || donorAddress.length() != 42) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid donorAddress"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        if (properties.isDemoMode() && demoLedger != null) {
            BigInteger contributionWei = demoLedger.getDonorContributionWei(schemeUuid, schemeId, donorAddress);
            Map<String, Object> out = new HashMap<>();
            out.put("schemeUuid", schemeUuid.toString());
            out.put("schemeId", schemeId.toString());
            out.put("donorAddress", donorAddress);
            out.put("contributionWei", contributionWei.toString());
            out.put("contributionPol", new BigDecimal(contributionWei).movePointLeft(18).toPlainString());
            return ResponseEntity.ok(out);
        }
        Function function = new Function(
                "getDonorContribution",
                List.of(new Uint256(schemeId), new Address(donorAddress)),
                Collections.singletonList(new TypeReference<Uint256>() {})
        );
        String data = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(donorAddress, properties.getContractAddress(), data),
                DefaultBlockParameterName.LATEST
        ).send();
        BigInteger contributionWei = ((Uint256) FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters()).get(0)).getValue();
        Map<String, Object> out = new HashMap<>();
        out.put("schemeUuid", schemeUuid.toString());
        out.put("schemeId", schemeId.toString());
        out.put("donorAddress", donorAddress);
        out.put("contributionWei", contributionWei.toString());
        out.put("contributionPol", new BigDecimal(contributionWei).movePointLeft(18).toPlainString());
        return ResponseEntity.ok(out);
    }

    @GetMapping("/events/recent")
    public ResponseEntity<List<BlockchainEvent>> recentEvents() {
        return ResponseEntity.ok(eventRepository.findTop50ByOrderByCreatedAtDesc());
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/create")
    public ResponseEntity<Map<String, Object>> ensureScheme(@PathVariable UUID schemeUuid) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        boolean exists = escrowClient.schemeExists(schemeId);
        if (!exists) {
            TransactionReceipt receipt = escrowClient.createScheme(schemeId);
            return ResponseEntity.ok(txResponse("created", receipt));
        }
        Map<String, Object> out = new HashMap<>();
        out.put("status", "exists");
        out.put("schemeId", schemeId.toString());
        return ResponseEntity.ok(out);
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/lock")
    public ResponseEntity<Map<String, Object>> lockFunds(@PathVariable UUID schemeUuid) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        TransactionReceipt receipt = escrowClient.lockFunds(schemeId);
        return ResponseEntity.ok(txResponse("locked", receipt));
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/milestones/{milestoneId}")
    public ResponseEntity<Map<String, Object>> createMilestone(@PathVariable UUID schemeUuid,
                                                               @PathVariable long milestoneId,
                                                               @RequestParam(name = "amountEth", required = false) String amountEth,
                                                               @RequestParam(name = "amountWei", required = false) String amountWei) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        BigInteger valueWei = parseAmountWei(amountEth, amountWei);
        TransactionReceipt receipt = escrowClient.createMilestone(schemeId, BigInteger.valueOf(milestoneId), valueWei);
        return ResponseEntity.ok(txResponse("milestoneCreated", receipt));
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/milestones/{milestoneId}/vendor")
    public ResponseEntity<Map<String, Object>> setVendor(@PathVariable UUID schemeUuid,
                                                         @PathVariable long milestoneId,
                                                         @RequestParam("vendorAddress") String vendorAddress) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        TransactionReceipt receipt = escrowClient.setVendorForMilestone(schemeId, BigInteger.valueOf(milestoneId), vendorAddress);
        return ResponseEntity.ok(txResponse("vendorSet", receipt));
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/milestones/{milestoneId}/quotation")
    public ResponseEntity<Map<String, Object>> storeQuotation(@PathVariable UUID schemeUuid,
                                                              @PathVariable long milestoneId,
                                                              @RequestParam("ipfsHash") String ipfsHash) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        TransactionReceipt receipt = escrowClient.storeQuotationHash(schemeId, BigInteger.valueOf(milestoneId), ipfsHash);
        return ResponseEntity.ok(txResponse("quotationStored", receipt));
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/milestones/{milestoneId}/approve")
    public ResponseEntity<Map<String, Object>> approveProof(@PathVariable UUID schemeUuid,
                                                            @PathVariable long milestoneId) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        TransactionReceipt receipt = escrowClient.approveProof(schemeId, BigInteger.valueOf(milestoneId));
        return ResponseEntity.ok(txResponse("approved", receipt));
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/milestones/{milestoneId}/reject")
    public ResponseEntity<Map<String, Object>> rejectProof(@PathVariable UUID schemeUuid,
                                                           @PathVariable long milestoneId) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        TransactionReceipt receipt = escrowClient.rejectProof(schemeId, BigInteger.valueOf(milestoneId));
        return ResponseEntity.ok(txResponse("rejected", receipt));
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/milestones/{milestoneId}/release")
    public ResponseEntity<Map<String, Object>> releasePayment(@PathVariable UUID schemeUuid,
                                                              @PathVariable long milestoneId) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        TransactionReceipt receipt = escrowClient.releasePayment(schemeId, BigInteger.valueOf(milestoneId));
        return ResponseEntity.ok(txResponse("released", receipt));
    }

    @RequireRole(UserRole.NGO)
    @PostMapping("/schemes/{schemeUuid}/milestones/{milestoneId}/refund")
    public ResponseEntity<Map<String, Object>> refund(@PathVariable UUID schemeUuid,
                                                      @PathVariable long milestoneId,
                                                      @RequestParam("toAddress") String toAddress) throws Exception {
        if (escrowClient == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Blockchain signing not configured (missing private key)"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        TransactionReceipt receipt = escrowClient.refundIfRejected(schemeId, BigInteger.valueOf(milestoneId), toAddress);
        return ResponseEntity.ok(txResponse("refunded", receipt));
    }

    @RequireRole(UserRole.DONOR)
    @GetMapping("/tx/deposit/{schemeUuid}")
    public ResponseEntity<Map<String, Object>> buildDepositTx(@PathVariable UUID schemeUuid,
                                                              @RequestParam(name = "amountEth", required = false) String amountEth,
                                                              @RequestParam(name = "amountWei", required = false) String amountWei) {
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        BigInteger valueWei = parseAmountWei(amountEth, amountWei);
        Function function = new Function(
                "depositFunds",
                Collections.singletonList(new Uint256(schemeId)),
                Collections.emptyList()
        );
        String data = FunctionEncoder.encode(function);
        Map<String, Object> out = new HashMap<>();
        out.put("to", properties.getContractAddress());
        out.put("valueWei", valueWei.toString());
        out.put("data", data);
        return ResponseEntity.ok(out);
    }

    @RequireRole(UserRole.DONOR)
    @PostMapping("/demo/deposit/{schemeUuid}")
    public ResponseEntity<Map<String, Object>> demoDeposit(@PathVariable UUID schemeUuid,
                                                           @RequestParam("amountWei") String amountWei,
                                                           @RequestParam(name = "donorAddress", required = false) String donorAddress) {
        if (!properties.isDemoMode() || demoLedger == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Demo mode is not enabled"));
        }
        if (donorAddress == null || donorAddress.isBlank()) {
            donorAddress = "0x0000000000000000000000000000000000000000";
        }
        if (!donorAddress.startsWith("0x") || donorAddress.length() != 42) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid donorAddress"));
        }
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        BigInteger wei = new BigInteger(amountWei);
        String txHash = demoLedger.recordDeposit(schemeUuid, schemeId, donorAddress, wei);
        return ResponseEntity.ok(Map.of("status", "demoDeposited", "txHash", txHash));
    }

    @RequireRole(UserRole.VENDOR)
    @GetMapping("/tx/submitProof/{schemeUuid}/{milestoneId}")
    public ResponseEntity<Map<String, Object>> buildSubmitProofTx(@PathVariable UUID schemeUuid,
                                                                  @PathVariable long milestoneId,
                                                                  @RequestParam("ipfsHash") String ipfsHash) {
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        Function function = new Function(
                "submitProof",
                List.of(new Uint256(schemeId), new Uint256(BigInteger.valueOf(milestoneId)), new Utf8String(ipfsHash)),
                Collections.emptyList()
        );
        String data = FunctionEncoder.encode(function);
        Map<String, Object> out = new HashMap<>();
        out.put("to", properties.getContractAddress());
        out.put("valueWei", "0");
        out.put("data", data);
        return ResponseEntity.ok(out);
    }

    private static Map<String, Object> txResponse(String status, TransactionReceipt receipt) {
        Map<String, Object> out = new HashMap<>();
        out.put("status", status);
        out.put("txHash", receipt.getTransactionHash());
        out.put("blockNumber", receipt.getBlockNumber() != null ? receipt.getBlockNumber().toString() : null);
        return out;
    }

    private static BigInteger parseAmountWei(String amountEth, String amountWei) {
        if (amountWei != null && !amountWei.isBlank()) {
            return new BigInteger(amountWei);
        }
        if (amountEth == null || amountEth.isBlank()) {
            throw new IllegalArgumentException("amountEth or amountWei is required");
        }
        BigDecimal eth = new BigDecimal(amountEth);
        return eth.multiply(BigDecimal.TEN.pow(18)).toBigIntegerExact();
    }
}
