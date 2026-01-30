package com.trustchain.backend.service.blockchain;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.model.BlockchainEvent;
import com.trustchain.backend.model.DemoDonorContribution;
import com.trustchain.backend.model.DemoEscrowState;
import com.trustchain.backend.model.DemoSchemeBalance;
import com.trustchain.backend.model.DemoWalletBalance;
import com.trustchain.backend.repository.BlockchainEventRepository;
import com.trustchain.backend.repository.DemoDonorContributionRepository;
import com.trustchain.backend.repository.DemoEscrowStateRepository;
import com.trustchain.backend.repository.DemoSchemeBalanceRepository;
import com.trustchain.backend.repository.DemoWalletBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.UUID;

@Service
@ConditionalOnProperty(prefix = "blockchain", name = "demo-mode", havingValue = "true")
public class DemoEscrowLedgerService {
    private static final String STATE_KEY = "default";

    @Autowired
    private BlockchainProperties properties;

    @Autowired
    private DemoEscrowStateRepository stateRepository;

    @Autowired
    private DemoSchemeBalanceRepository schemeBalanceRepository;

    @Autowired
    private DemoDonorContributionRepository contributionRepository;

    @Autowired
    private BlockchainEventRepository eventRepository;

    @Autowired
    private DemoWalletBalanceRepository walletBalanceRepository;

    public BigInteger getContractBalanceWei() {
        DemoEscrowState state = stateRepository.findById(STATE_KEY).orElse(null);
        if (state == null || state.getContractBalanceWei() == null || state.getContractBalanceWei().isBlank()) {
            return BigInteger.ZERO;
        }
        return new BigInteger(state.getContractBalanceWei());
    }

    public BigInteger getSchemeBalanceWei(UUID schemeUuid, BigInteger schemeId) {
        DemoSchemeBalance bal = schemeBalanceRepository.findById(schemeUuid.toString()).orElse(null);
        if (bal == null || bal.getBalanceWei() == null || bal.getBalanceWei().isBlank()) {
            return BigInteger.ZERO;
        }
        return new BigInteger(bal.getBalanceWei());
    }

    public BigInteger getDonorContributionWei(UUID schemeUuid, BigInteger schemeId, String donorAddress) {
        DemoDonorContribution c = contributionRepository.findBySchemeUuidAndDonorAddress(schemeUuid.toString(), donorAddress).orElse(null);
        if (c == null || c.getAmountWei() == null || c.getAmountWei().isBlank()) {
            return BigInteger.ZERO;
        }
        return new BigInteger(c.getAmountWei());
    }

    public String recordDeposit(UUID schemeUuid, BigInteger schemeId, String donorAddress, BigInteger amountWei) {
        if (amountWei.signum() <= 0) {
            throw new IllegalArgumentException("amountWei must be > 0");
        }
        String su = schemeUuid.toString();

        DemoEscrowState state = stateRepository.findById(STATE_KEY).orElseGet(() -> {
            DemoEscrowState s = new DemoEscrowState();
            s.setStateKey(STATE_KEY);
            s.setContractBalanceWei("0");
            return s;
        });
        BigInteger contractBal = new BigInteger(state.getContractBalanceWei());
        state.setContractBalanceWei(contractBal.add(amountWei).toString());
        stateRepository.save(state);

        DemoSchemeBalance schemeBal = schemeBalanceRepository.findById(su).orElseGet(() -> {
            DemoSchemeBalance b = new DemoSchemeBalance();
            b.setSchemeUuid(su);
            b.setSchemeId(schemeId.toString());
            b.setBalanceWei("0");
            return b;
        });
        BigInteger sb = new BigInteger(schemeBal.getBalanceWei());
        schemeBal.setBalanceWei(sb.add(amountWei).toString());
        schemeBal.setSchemeId(schemeId.toString());
        schemeBalanceRepository.save(schemeBal);

        String donorKey = su + ":" + donorAddress.toLowerCase();
        DemoDonorContribution contribution = contributionRepository.findById(donorKey).orElseGet(() -> {
            DemoDonorContribution c = new DemoDonorContribution();
            c.setContributionKey(donorKey);
            c.setSchemeUuid(su);
            c.setSchemeId(schemeId.toString());
            c.setDonorAddress(donorAddress);
            c.setAmountWei("0");
            return c;
        });
        BigInteger db = new BigInteger(contribution.getAmountWei());
        contribution.setAmountWei(db.add(amountWei).toString());
        contribution.setSchemeId(schemeId.toString());
        contributionRepository.save(contribution);

        String txHash = "demo-" + UUID.randomUUID();
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("FundsDeposited");
        e.setChainId(properties.getChainId());
        e.setContractAddress(properties.getContractAddress());
        e.setTransactionHash(txHash);
        e.setBlockNumber(0L);
        e.setSchemeId(schemeId.toString());
        e.setFromAddress(donorAddress);
        e.setAmountWei(amountWei.toString());
        eventRepository.save(e);
        return txHash;
    }

    public String recordRelease(UUID schemeUuid, BigInteger schemeId, String toAddress, BigInteger amountWei, UUID invoiceId) {
        if (amountWei.signum() <= 0) {
            throw new IllegalArgumentException("amountWei must be > 0");
        }
        if (toAddress == null || toAddress.isBlank()) {
            throw new IllegalArgumentException("toAddress is required");
        }
        String su = schemeUuid.toString();

        DemoSchemeBalance schemeBal = schemeBalanceRepository.findById(su).orElse(null);
        BigInteger sb = schemeBal == null || schemeBal.getBalanceWei() == null || schemeBal.getBalanceWei().isBlank()
                ? BigInteger.ZERO
                : new BigInteger(schemeBal.getBalanceWei());
        if (sb.compareTo(amountWei) < 0) {
            throw new IllegalStateException("Insufficient scheme escrow balance");
        }

        DemoEscrowState state = stateRepository.findById(STATE_KEY).orElse(null);
        BigInteger contractBal = state == null || state.getContractBalanceWei() == null || state.getContractBalanceWei().isBlank()
                ? BigInteger.ZERO
                : new BigInteger(state.getContractBalanceWei());
        if (contractBal.compareTo(amountWei) < 0) {
            throw new IllegalStateException("Insufficient contract balance");
        }

        if (state == null) {
            state = new DemoEscrowState();
            state.setStateKey(STATE_KEY);
        }
        state.setContractBalanceWei(contractBal.subtract(amountWei).toString());
        stateRepository.save(state);

        if (schemeBal == null) {
            schemeBal = new DemoSchemeBalance();
            schemeBal.setSchemeUuid(su);
            schemeBal.setSchemeId(schemeId.toString());
        }
        schemeBal.setBalanceWei(sb.subtract(amountWei).toString());
        schemeBal.setSchemeId(schemeId.toString());
        schemeBalanceRepository.save(schemeBal);

        String normalizedTo = toAddress.trim().toLowerCase();
        DemoWalletBalance walletBal = walletBalanceRepository.findById(normalizedTo).orElseGet(() -> {
            DemoWalletBalance b = new DemoWalletBalance();
            b.setAddress(normalizedTo);
            b.setBalanceWei("0");
            return b;
        });
        BigInteger wb = walletBal.getBalanceWei() == null || walletBal.getBalanceWei().isBlank()
                ? BigInteger.ZERO
                : new BigInteger(walletBal.getBalanceWei());
        walletBal.setBalanceWei(wb.add(amountWei).toString());
        walletBalanceRepository.save(walletBal);

        String txHash = "demo-" + UUID.randomUUID();
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("FundsReleased");
        e.setChainId(properties.getChainId());
        e.setContractAddress(properties.getContractAddress());
        e.setTransactionHash(txHash);
        e.setBlockNumber(0L);
        e.setSchemeId(schemeId.toString());
        e.setInvoiceId(invoiceId != null ? invoiceId.toString() : null);
        e.setFromAddress("demo-escrow");
        e.setVendorAddress(normalizedTo);
        e.setAmountWei(amountWei.toString());
        eventRepository.save(e);
        return txHash;
    }
}
