package com.trustchain.backend.service;

import com.trustchain.backend.model.Invoice;
import com.trustchain.backend.model.KycRecord;
import com.trustchain.backend.model.Manage;
import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.model.PanRecord;
import com.trustchain.backend.model.Vendor;
import com.trustchain.backend.repository.GovernmentRepository;
import com.trustchain.backend.repository.InvoiceRepository;
import com.trustchain.backend.repository.KycRecordRepository;
import com.trustchain.backend.repository.ManageRepository;
import com.trustchain.backend.repository.NgoVendorRepository;
import com.trustchain.backend.repository.PanRecordRepository;
import com.trustchain.backend.repository.VendorRepository;
import com.trustchain.backend.service.blockchain.InvoiceBlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private GovernmentRepository governmentRepository;

    @Autowired
    private ManageRepository manageRepository;

    @Autowired
    private NgoVendorRepository ngoVendorRepository;

    @Autowired
    private IpfsService ipfsService;

    @Autowired
    private KycRecordRepository kycRecordRepository;

    @Autowired
    private PanRecordRepository panRecordRepository;

    @Autowired
    private InvoiceBlockchainService invoiceBlockchainService;

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public List<Invoice> getInvoicesByVendorUserId(String userId) {
        return invoiceRepository.findByVendor_UserId(userId);
    }

    public List<Invoice> getInvoicesByNgoUserId(String userId) {
        return invoiceRepository.findByManage_Ngo_UserId(userId);
    }

    public List<Invoice> getInvoicesByGovernmentUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }

        return governmentRepository.findByUserId(userId)
                .map(g -> {
                    List<Invoice> byGovtId = invoiceRepository.findByManage_Scheme_Government_GovtId(g.getGovtId());
                    if (!byGovtId.isEmpty()) {
                        return byGovtId;
                    }
                    List<Invoice> byUserId = invoiceRepository.findByManage_Scheme_Government_UserId(userId);
                    if (!byUserId.isEmpty()) {
                        return byUserId;
                    }
                    return invoiceRepository.findAll();
                })
                .orElseGet(() -> {
                    List<Invoice> byUserId = invoiceRepository.findByManage_Scheme_Government_UserId(userId);
                    return byUserId.isEmpty() ? invoiceRepository.findAll() : byUserId;
                });
    }

    public Optional<Invoice> getInvoiceById(UUID id) {
        return invoiceRepository.findById(id);
    }

    public Invoice createInvoice(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    public Invoice uploadInvoiceAndCreate(String vendorUserId, UUID manageId, Double amount, byte[] fileBytes, String filename, String contentType) {
        if (manageId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "manageId is required");
        }
        if (amount == null || amount < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount must be >= 0");
        }

        boolean aadhaarVerified = kycRecordRepository.existsByVendorIdAndStatus(vendorUserId, KycRecord.VerificationStatus.VERIFIED);
        boolean panVerified = panRecordRepository.existsByVendorIdAndStatus(vendorUserId, PanRecord.VerificationStatus.VERIFIED);
        if (!aadhaarVerified || !panVerified) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "KYC not verified");
        }

        Vendor vendor = vendorRepository.findByUserId(vendorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));

        Manage manage = manageRepository.findById(manageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        NgoVendor order = ngoVendorRepository.findByManage_ManageIdAndVendor_UserId(manageId, vendorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No accepted vendor request for this project"));

        if (order.getStatus() == null || !order.getStatus().equalsIgnoreCase("ACCEPTED")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vendor request is not accepted for this project");
        }

        String cid = ipfsService.uploadInvoice(fileBytes, filename, contentType);

        Invoice invoice = new Invoice();
        UUID invoiceId = UUID.randomUUID();
        invoice.setInvoiceId(invoiceId);
        invoice.setVendor(vendor);
        invoice.setManage(manage);
        invoice.setAmount(amount);
        invoice.setInvoiceIpfsHash(cid);
        invoice.setStatus("PENDING");
        invoice.setCreatedAt(LocalDateTime.now());

        invoiceBlockchainService.storeInvoiceCid(invoiceId, cid);

        return invoiceRepository.save(invoice);
    }

    public Invoice ngoDecision(UUID invoiceId, String decision, String ngoUserId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (invoice.getManage() == null || invoice.getManage().getNgo() == null || invoice.getManage().getNgo().getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice project NGO not set");
        }
        if (!invoice.getManage().getNgo().getUserId().equals(ngoUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to approve this invoice");
        }

        if (invoice.getStatus() == null || !invoice.getStatus().equalsIgnoreCase("PENDING")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice is not pending NGO approval");
        }

        String normalized = normalizeDecision(decision);
        if (normalized.equals("ACCEPTED")) {
            invoice.setStatus("NGO_ACCEPTED");
        } else {
            invoice.setStatus("REJECTED");
        }

        return invoiceRepository.save(invoice);
    }

    public Invoice governmentDecision(UUID invoiceId, String decision, String governmentUserId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (invoice.getManage() == null || invoice.getManage().getScheme() == null
                || invoice.getManage().getScheme().getGovernment() == null
                || invoice.getManage().getScheme().getGovernment().getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice scheme government not set");
        }
        if (!invoice.getManage().getScheme().getGovernment().getUserId().equals(governmentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to approve this invoice");
        }

        if (invoice.getStatus() == null || !invoice.getStatus().equalsIgnoreCase("NGO_ACCEPTED")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice is not pending government approval");
        }

        String normalized = normalizeDecision(decision);
        if (normalized.equals("ACCEPTED")) {
            invoice.setStatus("ACCEPTED");
        } else {
            invoice.setStatus("REJECTED");
        }

        return invoiceRepository.save(invoice);
    }

    public Invoice updateInvoice(UUID id, Invoice invoice) {
        if (invoiceRepository.existsById(id)) {
            invoice.setInvoiceId(id);
            return invoiceRepository.save(invoice);
        }
        return null;
    }

    public void deleteInvoice(UUID id) {
        invoiceRepository.deleteById(id);
    }

    private String normalizeDecision(String decision) {
        if (decision == null || decision.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "decision is required");
        }
        String normalized = decision.trim().toUpperCase();
        if (!normalized.equals("ACCEPTED") && !normalized.equals("REJECTED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "decision must be ACCEPTED or REJECTED");
        }
        return normalized;
    }
}
