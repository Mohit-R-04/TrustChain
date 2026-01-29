package com.trustchain.backend.service.blockchain;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.model.BlockchainEvent;
import com.trustchain.backend.repository.BlockchainEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.ByteBuffer;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvoiceBlockchainService {

    @Autowired(required = false)
    private TrustChainEscrowClient escrowClient;

    @Autowired
    private BlockchainProperties properties;

    @Autowired(required = false)
    private DemoEscrowLedgerService demoLedger;

    @Autowired
    private BlockchainEventRepository eventRepository;

    public void storeInvoiceCid(UUID invoiceId, String cid) {
        if (escrowClient != null) {
            try {
                escrowClient.storeInvoiceHash(uuidToBytes32(invoiceId), cid);
                return;
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to store invoice hash on blockchain");
            }
        }

        if (properties.isDemoMode() && demoLedger != null) {
            BlockchainEvent e = new BlockchainEvent();
            e.setEventName("InvoiceHashStored");
            e.setChainId(properties.getChainId());
            e.setContractAddress(properties.getContractAddress());
            e.setTransactionHash("demo-" + UUID.randomUUID());
            e.setBlockNumber(0L);
            e.setInvoiceId(uuidToBytes32Hex(invoiceId));
            e.setIpfsHash(cid);
            eventRepository.save(e);
            return;
        }

        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Blockchain is not configured");
    }

    public String getInvoiceCid(UUID invoiceId) {
        if (escrowClient != null) {
            try {
                return escrowClient.getInvoiceHash(uuidToBytes32(invoiceId));
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to read invoice hash from blockchain");
            }
        }

        if (properties.isDemoMode() && demoLedger != null) {
            String invoiceIdHex = uuidToBytes32Hex(invoiceId);
            Optional<BlockchainEvent> e = eventRepository.findTopByEventNameAndInvoiceIdOrderByCreatedAtDesc("InvoiceHashStored", invoiceIdHex);
            if (e.isEmpty() || e.get().getIpfsHash() == null || e.get().getIpfsHash().isBlank()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice hash not found on blockchain");
            }
            return e.get().getIpfsHash();
        }

        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Blockchain is not configured");
    }

    private byte[] uuidToBytes32(UUID value) {
        byte[] uuidBytes = ByteBuffer.allocate(16)
                .putLong(value.getMostSignificantBits())
                .putLong(value.getLeastSignificantBits())
                .array();
        byte[] bytes32 = new byte[32];
        System.arraycopy(uuidBytes, 0, bytes32, 0, uuidBytes.length);
        return bytes32;
    }

    private String uuidToBytes32Hex(UUID value) {
        byte[] bytes32 = uuidToBytes32(value);
        char[] hexArray = "0123456789abcdef".toCharArray();
        char[] hexChars = new char[bytes32.length * 2];
        for (int j = 0; j < bytes32.length; j++) {
            int v = bytes32[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return "0x" + new String(hexChars);
    }
}
