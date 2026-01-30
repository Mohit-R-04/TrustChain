package com.trustchain.backend.service;

import com.trustchain.backend.model.BlockchainEvent;
import com.trustchain.backend.model.Donation;
import com.trustchain.backend.model.InvoicePayout;
import com.trustchain.backend.repository.BlockchainEventRepository;
import com.trustchain.backend.repository.DonationRepository;
import com.trustchain.backend.repository.InvoicePayoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IpfsTransactionBackfillService {
    private final DonationRepository donationRepository;
    private final InvoicePayoutRepository invoicePayoutRepository;
    private final BlockchainEventRepository blockchainEventRepository;
    private final IpfsService ipfsService;

    public IpfsTransactionBackfillService(
            DonationRepository donationRepository,
            InvoicePayoutRepository invoicePayoutRepository,
            BlockchainEventRepository blockchainEventRepository,
            IpfsService ipfsService
    ) {
        this.donationRepository = donationRepository;
        this.invoicePayoutRepository = invoicePayoutRepository;
        this.blockchainEventRepository = blockchainEventRepository;
        this.ipfsService = ipfsService;
    }

    @Transactional
    public Map<String, Object> backfill(int maxIterations) {
        int iterations = 0;
        int donationCount = 0;
        int payoutCount = 0;
        int eventCount = 0;

        while (iterations++ < Math.max(1, maxIterations)) {
            boolean progressed = false;

            List<Donation> donations = donationRepository.findTop200ByIpfsCidIsNullOrderByTimestampAsc();
            for (Donation d : donations) {
                if (d.getIpfsCid() != null && !d.getIpfsCid().isBlank()) {
                    continue;
                }
                String cid = uploadDonation(d);
                if (cid != null && !cid.isBlank()) {
                    d.setIpfsCid(cid);
                    donationRepository.save(d);
                    donationCount++;
                    progressed = true;
                }
            }

            List<InvoicePayout> payouts = invoicePayoutRepository.findTop200ByIpfsCidIsNullOrderByCreatedAtAsc();
            for (InvoicePayout p : payouts) {
                if (p.getIpfsCid() != null && !p.getIpfsCid().isBlank()) {
                    continue;
                }
                String cid = uploadPayout(p);
                if (cid != null && !cid.isBlank()) {
                    p.setIpfsCid(cid);
                    invoicePayoutRepository.save(p);
                    payoutCount++;
                    progressed = true;
                }
            }

            List<BlockchainEvent> events = blockchainEventRepository.findTop200ByIpfsHashIsNullAndEventNameInOrderByCreatedAtAsc(
                    List.of("FundsDeposited", "FundsReleased", "PaymentReleased")
            );
            for (BlockchainEvent e : events) {
                if (e.getIpfsHash() != null && !e.getIpfsHash().isBlank()) {
                    continue;
                }
                String cid = uploadBlockchainEvent(e);
                if (cid != null && !cid.isBlank()) {
                    e.setIpfsHash(cid);
                    blockchainEventRepository.save(e);
                    eventCount++;
                    progressed = true;
                }
            }

            if (!progressed) {
                break;
            }
        }

        Map<String, Object> out = new HashMap<>();
        out.put("donationsPinned", donationCount);
        out.put("payoutsPinned", payoutCount);
        out.put("eventsPinned", eventCount);
        out.put("iterations", iterations - 1);
        return out;
    }

    private String uploadDonation(Donation d) {
        if (d == null || d.getDonationId() == null) {
            return null;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "DONATION_PAYMENT_BACKFILL");
        payload.put("donationId", d.getDonationId().toString());
        payload.put("schemeId", d.getScheme() != null ? String.valueOf(d.getScheme().getSchemeId()) : null);
        payload.put("schemeName", d.getScheme() != null ? d.getScheme().getSchemeName() : null);
        payload.put("amountInr", d.getAmount());
        payload.put("currency", "INR");
        payload.put("transactionRef", d.getTransactionRef());
        payload.put("timestamp", d.getTimestamp() != null ? d.getTimestamp().toString() : null);
        payload.put("donorUserId", d.getDonor() != null ? d.getDonor().getUserId() : null);
        payload.put("governmentUserId", d.getGovernment() != null ? d.getGovernment().getUserId() : null);
        return ipfsService.uploadJson(payload, "donation-" + d.getDonationId() + ".json");
    }

    private String uploadPayout(InvoicePayout p) {
        if (p == null || p.getInvoiceId() == null || p.getTransactionHash() == null || p.getTransactionHash().isBlank()) {
            return null;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "INVOICE_PAYOUT_BACKFILL");
        payload.put("invoiceId", p.getInvoiceId().toString());
        payload.put("schemeId", p.getSchemeId() != null ? p.getSchemeId().toString() : null);
        payload.put("manageId", p.getManageId() != null ? p.getManageId().toString() : null);
        payload.put("ngoId", p.getNgoId() != null ? p.getNgoId().toString() : null);
        payload.put("vendorId", p.getVendorId() != null ? p.getVendorId().toString() : null);
        payload.put("amountInr", p.getAmountInr());
        payload.put("amountWei", p.getAmountWei());
        payload.put("fromAddress", p.getFromAddress());
        payload.put("toAddress", p.getToAddress());
        payload.put("txHash", p.getTransactionHash());
        return ipfsService.uploadJson(payload, "invoice-payout-" + p.getInvoiceId() + "-" + p.getTransactionHash() + ".json");
    }

    private String uploadBlockchainEvent(BlockchainEvent e) {
        if (e == null || e.getTransactionHash() == null || e.getTransactionHash().isBlank()) {
            return null;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BLOCKCHAIN_EVENT_TX_BACKFILL");
        payload.put("eventName", e.getEventName());
        payload.put("txHash", e.getTransactionHash());
        payload.put("schemeId", e.getSchemeId());
        payload.put("from", e.getFromAddress());
        payload.put("to", e.getVendorAddress());
        payload.put("amountWei", e.getAmountWei());
        payload.put("invoiceId", e.getInvoiceId());
        payload.put("createdAt", e.getCreatedAt() != null ? e.getCreatedAt().toString() : null);
        return ipfsService.uploadJson(payload, "tx-" + e.getTransactionHash() + ".json");
    }
}

