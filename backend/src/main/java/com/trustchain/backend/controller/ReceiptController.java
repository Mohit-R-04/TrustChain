package com.trustchain.backend.controller;

import com.trustchain.backend.model.Receipt;
import com.trustchain.backend.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/receipt")
public class ReceiptController {

    @Autowired
    private ReceiptService receiptService;

    @GetMapping
    public ResponseEntity<List<Receipt>> getAllReceipts() {
        // TODO: Implement endpoint
        return null;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Receipt> getReceiptById(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }

    @PostMapping
    public ResponseEntity<Receipt> createReceipt(@RequestBody Receipt receipt) {
        // TODO: Implement endpoint
        return null;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Receipt> updateReceipt(@PathVariable UUID id, @RequestBody Receipt receipt) {
        // TODO: Implement endpoint
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceipt(@PathVariable UUID id) {
        // TODO: Implement endpoint
        return null;
    }
}
