package com.trustchain.backend.service;

import com.trustchain.backend.model.Invoice;
import com.trustchain.backend.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public List<Invoice> getInvoicesByVendorUserId(String userId) {
        return invoiceRepository.findByVendor_UserId(userId);
    }

    public Optional<Invoice> getInvoiceById(UUID id) {
        return invoiceRepository.findById(id);
    }

    public Invoice createInvoice(Invoice invoice) {
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
}
