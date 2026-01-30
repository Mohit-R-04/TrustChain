package com.trustchain.backend.service.blockchain;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.model.BlockchainEvent;
import com.trustchain.backend.model.BlockchainSyncState;
import com.trustchain.backend.repository.BlockchainEventRepository;
import com.trustchain.backend.repository.BlockchainSyncStateRepository;
import com.trustchain.backend.service.IpfsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterNumber;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthLog;
import org.web3j.protocol.core.methods.response.EthLog.LogResult;
import org.web3j.protocol.core.methods.response.Log;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@ConditionalOnProperty(prefix = "blockchain", name = "enabled", havingValue = "true")
public class BlockchainEventSyncService {
    private static final String SYNC_KEY = "trustchain-escrow";
    private static final Logger log = LoggerFactory.getLogger(BlockchainEventSyncService.class);

    private static final Event FUNDS_DEPOSITED = new Event("FundsDeposited", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Uint256>() {}
    ));
    private static final Event PROOF_SUBMITTED = new Event("ProofSubmitted", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Utf8String>() {}
    ));
    private static final Event MILESTONE_APPROVED = new Event("MilestoneApproved", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>() {}
    ));
    private static final Event PAYMENT_RELEASED = new Event("PaymentReleased", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Uint256>() {}
    ));
    private static final Event VENDOR_SET = new Event("VendorSet", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>() {}
    ));
    private static final Event QUOTATION_STORED = new Event("QuotationStored", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Utf8String>() {}
    ));
    private static final Event MILESTONE_CREATED = new Event("MilestoneCreated", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>() {}
    ));
    private static final Event MILESTONE_STATUS_UPDATED = new Event("MilestoneStatusUpdated", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint8>() {}
    ));
    private static final Event MILESTONE_REJECTED = new Event("MilestoneRejected", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>() {}
    ));
    private static final Event REFUND_ISSUED = new Event("RefundIssued", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Uint256>() {}
    ));
    private static final Event FUNDS_LOCKED = new Event("FundsLocked", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Uint256>() {}
    ));
    private static final Event SCHEME_CREATED = new Event("SchemeCreated", Arrays.asList(
            new TypeReference<Uint256>(true) {},
            new TypeReference<Address>(true) {}
    ));
    private static final Event INVOICE_HASH_STORED = new Event("InvoiceHashStored", Arrays.asList(
            new TypeReference<Bytes32>(true) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Utf8String>() {}
    ));

    @Autowired
    private Web3j web3j;

    @Autowired
    private BlockchainProperties properties;

    @Autowired
    private BlockchainEventRepository eventRepository;

    @Autowired
    private BlockchainSyncStateRepository syncStateRepository;

    @Autowired(required = false)
    private IpfsService ipfsService;

    @Scheduled(fixedDelayString = "${blockchain.poll-interval-ms:10000}")
    public void sync() throws Exception {
        String contract = properties.getContractAddress();
        if (contract == null || contract.isBlank()) {
            return;
        }

        BigInteger latestBlock = web3j.ethBlockNumber().send().getBlockNumber();
        BlockchainSyncState state = syncStateRepository.findById(SYNC_KEY).orElseGet(() -> {
            BlockchainSyncState s = new BlockchainSyncState();
            s.setSyncKey(SYNC_KEY);
            s.setLastProcessedBlock(null);
            return s;
        });

        BigInteger fromBlock = resolveFromBlock(state, latestBlock);
        if (fromBlock.compareTo(latestBlock) > 0) {
            return;
        }

        EthFilter filter = new EthFilter(new DefaultBlockParameterNumber(fromBlock), new DefaultBlockParameterNumber(latestBlock), contract);
        EthLog logs = web3j.ethGetLogs(filter).send();
        for (LogResult<?> logResult : logs.getLogs()) {
            Log log = (Log) logResult.get();
            persistIfRecognized(log);
        }

        state.setLastProcessedBlock(latestBlock.longValue());
        syncStateRepository.save(state);
    }

    private BigInteger resolveFromBlock(BlockchainSyncState state, BigInteger latestBlock) {
        Long configuredStart = properties.getStartBlock();
        if (state.getLastProcessedBlock() != null) {
            return BigInteger.valueOf(state.getLastProcessedBlock() + 1);
        }
        if (configuredStart != null) {
            return BigInteger.valueOf(configuredStart);
        }
        BigInteger fallback = latestBlock.subtract(BigInteger.valueOf(2000));
        if (fallback.signum() < 0) {
            fallback = BigInteger.ZERO;
        }
        return fallback;
    }

    private void persistIfRecognized(Log log) {
        if (log.getTopics() == null || log.getTopics().isEmpty()) {
            return;
        }
        String sig = log.getTopics().get(0);

        Optional<BlockchainEvent> event = Optional.empty();

        event = event.or(() -> decodeFundsDeposited(sig, log));
        event = event.or(() -> decodeProofSubmitted(sig, log));
        event = event.or(() -> decodeMilestoneApproved(sig, log));
        event = event.or(() -> decodePaymentReleased(sig, log));
        event = event.or(() -> decodeVendorSet(sig, log));
        event = event.or(() -> decodeQuotationStored(sig, log));
        event = event.or(() -> decodeMilestoneCreated(sig, log));
        event = event.or(() -> decodeMilestoneStatusUpdated(sig, log));
        event = event.or(() -> decodeMilestoneRejected(sig, log));
        event = event.or(() -> decodeRefundIssued(sig, log));
        event = event.or(() -> decodeFundsLocked(sig, log));
        event = event.or(() -> decodeSchemeCreated(sig, log));
        event = event.or(() -> decodeInvoiceHashStored(sig, log));

        if (event.isEmpty()) {
            return;
        }

        BlockchainEvent e = event.get();
        e.setChainId(properties.getChainId());
        e.setContractAddress(properties.getContractAddress());
        e.setTransactionHash(log.getTransactionHash());
        e.setBlockNumber(log.getBlockNumber() != null ? log.getBlockNumber().longValue() : null);

        if (e.getIpfsHash() == null || e.getIpfsHash().isBlank()) {
            if ("FundsDeposited".equalsIgnoreCase(e.getEventName()) || "PaymentReleased".equalsIgnoreCase(e.getEventName())) {
                String cid = tryUploadTxDetails(e);
                if (cid != null && !cid.isBlank()) {
                    e.setIpfsHash(cid);
                }
            }
        }

        if (eventRepository.existsByTransactionHashAndEventNameAndBlockNumber(e.getTransactionHash(), e.getEventName(), e.getBlockNumber())) {
            if (e.getIpfsHash() != null && !e.getIpfsHash().isBlank()) {
                eventRepository.findTopByTransactionHashAndEventNameAndBlockNumber(e.getTransactionHash(), e.getEventName(), e.getBlockNumber())
                        .filter(existing -> existing.getIpfsHash() == null || existing.getIpfsHash().isBlank())
                        .ifPresent(existing -> {
                            existing.setIpfsHash(e.getIpfsHash());
                            eventRepository.save(existing);
                        });
            }
            return;
        }
        eventRepository.save(e);
    }

    private String tryUploadTxDetails(BlockchainEvent e) {
        if (ipfsService == null || e == null || e.getTransactionHash() == null || e.getTransactionHash().isBlank()) {
            return null;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "CHAIN_TX");
        payload.put("eventName", e.getEventName());
        payload.put("txHash", e.getTransactionHash());
        payload.put("schemeId", e.getSchemeId());
        payload.put("milestoneId", e.getMilestoneId());
        payload.put("from", e.getFromAddress());
        payload.put("to", e.getVendorAddress());
        payload.put("amountWei", e.getAmountWei());
        payload.put("blockNumber", e.getBlockNumber());
        try {
            return ipfsService.uploadJson(payload, "tx-" + e.getTransactionHash() + ".json");
        } catch (Exception ex) {
            log.warn("Failed to persist chain transaction details to IPFS for txHash={}", e.getTransactionHash());
            return null;
        }
    }

    private Optional<BlockchainEvent> decodeFundsDeposited(String sig, Log log) {
        if (!EventEncoder.encode(FUNDS_DEPOSITED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("FundsDeposited");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setFromAddress(topicToAddress(log.getTopics().get(2)));
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), FUNDS_DEPOSITED.getNonIndexedParameters());
        e.setAmountWei(((Uint256) data.get(0)).getValue().toString());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeProofSubmitted(String sig, Log log) {
        if (!EventEncoder.encode(PROOF_SUBMITTED).equals(sig) || log.getTopics().size() < 4) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("ProofSubmitted");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        e.setVendorAddress(topicToAddress(log.getTopics().get(3)));
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), PROOF_SUBMITTED.getNonIndexedParameters());
        e.setIpfsHash(((Utf8String) data.get(0)).getValue());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeMilestoneApproved(String sig, Log log) {
        if (!EventEncoder.encode(MILESTONE_APPROVED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("MilestoneApproved");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), MILESTONE_APPROVED.getNonIndexedParameters());
        e.setFromAddress(((Address) data.get(0)).getValue());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodePaymentReleased(String sig, Log log) {
        if (!EventEncoder.encode(PAYMENT_RELEASED).equals(sig) || log.getTopics().size() < 4) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("PaymentReleased");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        e.setVendorAddress(topicToAddress(log.getTopics().get(3)));
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), PAYMENT_RELEASED.getNonIndexedParameters());
        e.setAmountWei(((Uint256) data.get(0)).getValue().toString());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeVendorSet(String sig, Log log) {
        if (!EventEncoder.encode(VENDOR_SET).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("VendorSet");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), VENDOR_SET.getNonIndexedParameters());
        e.setVendorAddress(((Address) data.get(0)).getValue());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeQuotationStored(String sig, Log log) {
        if (!EventEncoder.encode(QUOTATION_STORED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("QuotationStored");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), QUOTATION_STORED.getNonIndexedParameters());
        e.setIpfsHash(((Utf8String) data.get(0)).getValue());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeMilestoneCreated(String sig, Log log) {
        if (!EventEncoder.encode(MILESTONE_CREATED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("MilestoneCreated");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), MILESTONE_CREATED.getNonIndexedParameters());
        e.setAmountWei(((Uint256) data.get(0)).getValue().toString());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeMilestoneStatusUpdated(String sig, Log log) {
        if (!EventEncoder.encode(MILESTONE_STATUS_UPDATED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("MilestoneStatusUpdated");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), MILESTONE_STATUS_UPDATED.getNonIndexedParameters());
        e.setAmountWei(((Uint8) data.get(0)).getValue().toString());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeMilestoneRejected(String sig, Log log) {
        if (!EventEncoder.encode(MILESTONE_REJECTED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("MilestoneRejected");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), MILESTONE_REJECTED.getNonIndexedParameters());
        e.setFromAddress(((Address) data.get(0)).getValue());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeRefundIssued(String sig, Log log) {
        if (!EventEncoder.encode(REFUND_ISSUED).equals(sig) || log.getTopics().size() < 4) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("RefundIssued");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setMilestoneId(topicToUint256(log.getTopics().get(2)).toString());
        e.setFromAddress(topicToAddress(log.getTopics().get(3)));
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), REFUND_ISSUED.getNonIndexedParameters());
        e.setAmountWei(((Uint256) data.get(0)).getValue().toString());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeFundsLocked(String sig, Log log) {
        if (!EventEncoder.encode(FUNDS_LOCKED).equals(sig) || log.getTopics().size() < 2) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("FundsLocked");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), FUNDS_LOCKED.getNonIndexedParameters());
        e.setAmountWei(((Uint256) data.get(0)).getValue().toString());
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeSchemeCreated(String sig, Log log) {
        if (!EventEncoder.encode(SCHEME_CREATED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("SchemeCreated");
        e.setSchemeId(topicToUint256(log.getTopics().get(1)).toString());
        e.setFromAddress(topicToAddress(log.getTopics().get(2)));
        return Optional.of(e);
    }

    private Optional<BlockchainEvent> decodeInvoiceHashStored(String sig, Log log) {
        if (!EventEncoder.encode(INVOICE_HASH_STORED).equals(sig) || log.getTopics().size() < 3) {
            return Optional.empty();
        }
        BlockchainEvent e = new BlockchainEvent();
        e.setEventName("InvoiceHashStored");
        e.setInvoiceId(topicToBytes32(log.getTopics().get(1)));
        e.setFromAddress(topicToAddress(log.getTopics().get(2)));
        List<Type> data = FunctionReturnDecoder.decode(log.getData(), INVOICE_HASH_STORED.getNonIndexedParameters());
        e.setIpfsHash(((Utf8String) data.get(0)).getValue());
        return Optional.of(e);
    }

    private static BigInteger topicToUint256(String topic) {
        String clean = topic.startsWith("0x") ? topic.substring(2) : topic;
        return new BigInteger(clean, 16);
    }

    private static String topicToAddress(String topic) {
        String clean = topic.startsWith("0x") ? topic.substring(2) : topic;
        if (clean.length() < 40) {
            return "0x" + clean;
        }
        return "0x" + clean.substring(clean.length() - 40);
    }

    private static String topicToBytes32(String topic) {
        String clean = topic.startsWith("0x") ? topic.substring(2) : topic;
        if (clean.length() >= 64) {
            return "0x" + clean.substring(clean.length() - 64);
        }
        return "0x" + "0".repeat(64 - clean.length()) + clean;
    }
}
