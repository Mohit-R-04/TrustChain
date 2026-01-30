package com.trustchain.backend.config;

import com.trustchain.backend.model.Invoice;
import com.trustchain.backend.repository.InvoiceRepository;
import com.trustchain.backend.security.InvoiceCidCrypto;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
public class InvoiceCidRehashRunner implements ApplicationRunner {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceCidCrypto invoiceCidCrypto;

    public InvoiceCidRehashRunner(InvoiceRepository invoiceRepository, InvoiceCidCrypto invoiceCidCrypto) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceCidCrypto = invoiceCidCrypto;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Invoice> invoices = invoiceRepository.findAll();
        if (invoices.isEmpty()) {
            return;
        }

        List<Invoice> changed = new ArrayList<>();
        for (Invoice invoice : invoices) {
            String stored = invoice.getInvoiceIpfsHash();
            if (stored == null || stored.isBlank() || invoiceCidCrypto.isHashed(stored)) {
                continue;
            }
            invoice.setInvoiceIpfsHash(invoiceCidCrypto.hash(stored));
            changed.add(invoice);
        }

        if (!changed.isEmpty()) {
            invoiceRepository.saveAll(changed);
        }
    }
}

