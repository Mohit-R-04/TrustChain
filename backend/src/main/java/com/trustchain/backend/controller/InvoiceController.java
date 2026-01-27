package com.trustchain.backend.controller;

import com.trustchain.backend.model.Invoice;
import com.trustchain.backend.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable UUID id, @RequestBody Invoice invoice) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
