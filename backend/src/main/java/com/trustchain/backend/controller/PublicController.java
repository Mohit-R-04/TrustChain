package com.trustchain.backend.controller;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.service.blockchain.DemoEscrowLedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired(required = false)
    private BlockchainProperties blockchainProperties;

    @Autowired(required = false)
    private Web3j web3j;

    @Autowired(required = false)
    private DemoEscrowLedgerService demoLedger;

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("ok", true);
    }

    @GetMapping("/blockchain/status")
    public Map<String, Object> blockchainStatus() {
        if (blockchainProperties == null) {
            return Map.of("enabled", false);
        }
        Map<String, Object> out = new HashMap<>();
        out.put("enabled", blockchainProperties.isEnabled());
        out.put("demoMode", blockchainProperties.isDemoMode());
        out.put("rpcUrl", blockchainProperties.getRpcUrl());
        out.put("chainId", blockchainProperties.getChainId());
        out.put("contractAddress", blockchainProperties.getContractAddress());
        return out;
    }

    @GetMapping("/blockchain/escrow/balance")
    public Map<String, Object> escrowBalance() throws Exception {
        if (blockchainProperties == null) {
            return Map.of("balanceWei", "0", "balancePol", "0");
        }
        BigInteger balanceWei;
        if (blockchainProperties.isDemoMode() && demoLedger != null) {
            balanceWei = demoLedger.getContractBalanceWei();
        } else if (web3j != null && blockchainProperties.getContractAddress() != null) {
            balanceWei = web3j.ethGetBalance(blockchainProperties.getContractAddress(), DefaultBlockParameterName.LATEST).send().getBalance();
        } else {
            balanceWei = BigInteger.ZERO;
        }
        return Map.of(
                "contractAddress", blockchainProperties.getContractAddress(),
                "balanceWei", balanceWei.toString(),
                "balancePol", new BigDecimal(balanceWei).movePointLeft(18).toPlainString()
        );
    }

    @PostMapping("/blockchain/demo/deposit")
    public Map<String, Object> demoDeposit(@RequestParam("schemeUuid") String schemeUuid,
                                           @RequestParam("amountWei") String amountWei,
                                           @RequestParam(name = "donorAddress", required = false) String donorAddress) {
        if (blockchainProperties == null || !blockchainProperties.isDemoMode() || demoLedger == null) {
            return Map.of("error", "Demo mode not enabled");
        }
        UUID su = UUID.fromString(schemeUuid);
        if (donorAddress == null || donorAddress.isBlank()) {
            donorAddress = "0x0000000000000000000000000000000000000000";
        }
        BigInteger wei = new BigInteger(amountWei);
        String txHash = demoLedger.recordDeposit(su, com.trustchain.backend.service.blockchain.BlockchainIdUtil.uuidToUint256(su), donorAddress, wei);
        return Map.of("status", "demoDeposited", "txHash", txHash);
    }
}
