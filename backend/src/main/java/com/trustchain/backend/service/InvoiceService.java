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
        // TODO: Implement method
        return null;
    }

    public Optional<Invoice> getInvoiceById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Invoice createInvoice(Invoice invoice) {
        // TODO: Implement method
        return null;
    }

    public Invoice updateInvoice(UUID id, Invoice invoice) {
        // TODO: Implement method
        return null;
    }

    public void deleteInvoice(UUID id) {
        // TODO: Implement method
    }
}
