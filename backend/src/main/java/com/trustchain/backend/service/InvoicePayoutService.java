package com.trustchain.backend.service;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.model.Invoice;
import com.trustchain.backend.model.InvoicePayout;
import com.trustchain.backend.model.Ngo;
import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.model.Vendor;
import com.trustchain.backend.repository.InvoicePayoutRepository;
import com.trustchain.backend.repository.NgoVendorRepository;
import com.trustchain.backend.service.blockchain.BlockchainAddressUtil;
import com.trustchain.backend.service.blockchain.BlockchainIdUtil;
import com.trustchain.backend.service.blockchain.DemoEscrowLedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvoicePayoutService {

    private static final BigDecimal INR_TO_WEI_SCALE = new BigDecimal("100000000000");
    private static final Logger log = LoggerFactory.getLogger(InvoicePayoutService.class);

    @Autowired(required = false)
    private BlockchainProperties blockchainProperties;

    @Autowired(required = false)
    private DemoEscrowLedgerService demoLedger;

    @Autowired
    private InvoicePayoutRepository payoutRepository;

    @Autowired
    private NgoVendorRepository ngoVendorRepository;

    @Autowired
    private IpfsService ipfsService;

    public InvoicePayout payoutToNgoAfterGovernmentAcceptance(Invoice invoice) {
        if (invoice == null || invoice.getInvoiceId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice is required");
        }

        UUID invoiceId = invoice.getInvoiceId();
        Optional<InvoicePayout> existing = payoutRepository.findTopByInvoiceIdOrderByCreatedAtDesc(invoiceId);
        if (existing.isPresent() && "SUCCESS".equalsIgnoreCase(existing.get().getStatus())) {
            return existing.get();
        }

        if (invoice.getManage() == null || invoice.getManage().getManageId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice project not set");
        }
        if (invoice.getVendor() == null || invoice.getVendor().getVendorId() == null || invoice.getVendor().getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice vendor not set");
        }
        if (invoice.getManage().getNgo() == null || invoice.getManage().getNgo().getNgoId() == null || invoice.getManage().getNgo().getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice NGO not set");
        }
        Scheme scheme = invoice.getManage().getScheme();
        if (scheme == null || scheme.getSchemeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice scheme not set");
        }

        NgoVendor order = ngoVendorRepository
                .findByManage_ManageIdAndVendor_UserId(invoice.getManage().getManageId(), invoice.getVendor().getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Vendor budget not found for this project"));

        Double allocatedBudgetInr = order.getAllocatedBudget();
        if (allocatedBudgetInr == null || allocatedBudgetInr <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Allocated budget must be > 0");
        }

        Ngo ngo = invoice.getManage().getNgo();
        Vendor vendor = invoice.getVendor();

        String toAddress = vendor.getWalletAddress();
        if (toAddress == null || toAddress.isBlank()) {
            toAddress = BlockchainAddressUtil.userIdToDemoAddress(vendor.getUserId());
        }

        Double invoiceAmountInr = invoice.getAmount();
        Double payoutAmountInr = invoiceAmountInr != null && invoiceAmountInr > 0 ? invoiceAmountInr : allocatedBudgetInr;
        BigInteger amountWei = BigDecimal.valueOf(payoutAmountInr).multiply(INR_TO_WEI_SCALE).toBigInteger();

        if (blockchainProperties == null || !blockchainProperties.isEnabled() || !blockchainProperties.isDemoMode() || demoLedger == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Demo escrow is not configured");
        }

        UUID schemeUuid = scheme.getSchemeId();
        BigInteger schemeId = BlockchainIdUtil.uuidToUint256(schemeUuid);
        String txHash;
        try {
            txHash = demoLedger.recordRelease(schemeUuid, schemeId, toAddress, amountWei, invoiceId);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to release funds");
        }

        InvoicePayout payout = new InvoicePayout();
        payout.setInvoiceId(invoiceId);
        payout.setSchemeId(schemeUuid);
        payout.setManageId(invoice.getManage().getManageId());
        payout.setNgoId(ngo.getNgoId());
        payout.setVendorId(vendor.getVendorId());
        payout.setAmountInr(payoutAmountInr);
        payout.setAmountWei(amountWei.toString());
        payout.setFromAddress("demo-escrow");
        payout.setToAddress(toAddress);
        payout.setTransactionHash(txHash);
        payout.setStatus("SUCCESS");
        payout.setIpfsCid(tryUploadPayoutDetailsToIpfs(payout));
        return payoutRepository.save(payout);
    }

    private String tryUploadPayoutDetailsToIpfs(InvoicePayout payout) {
        if (payout == null || payout.getInvoiceId() == null || payout.getTransactionHash() == null) {
            return null;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "INVOICE_PAYOUT");
        payload.put("invoiceId", payout.getInvoiceId().toString());
        payload.put("schemeId", payout.getSchemeId() != null ? payout.getSchemeId().toString() : null);
        payload.put("manageId", payout.getManageId() != null ? payout.getManageId().toString() : null);
        payload.put("ngoId", payout.getNgoId() != null ? payout.getNgoId().toString() : null);
        payload.put("vendorId", payout.getVendorId() != null ? payout.getVendorId().toString() : null);
        payload.put("amountInr", payout.getAmountInr());
        payload.put("amountWei", payout.getAmountWei());
        payload.put("fromAddress", payout.getFromAddress());
        payload.put("toAddress", payout.getToAddress());
        payload.put("txHash", payout.getTransactionHash());
        payload.put("mode", "demo");

        try {
            return ipfsService.uploadJson(payload, "invoice-payout-" + payout.getInvoiceId() + "-" + payout.getTransactionHash() + ".json");
        } catch (Exception e) {
            log.warn("Failed to persist invoice payout transaction details to IPFS for invoiceId={}, txHash={}", payout.getInvoiceId(), payout.getTransactionHash());
            return null;
        }
    }
}

