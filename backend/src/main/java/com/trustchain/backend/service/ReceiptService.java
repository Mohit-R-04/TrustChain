package com.trustchain.backend.service;

import com.trustchain.backend.model.Receipt;
import com.trustchain.backend.repository.ReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReceiptService {

    @Autowired
    private ReceiptRepository receiptRepository;

    public List<Receipt> getAllReceipts() {
        // TODO: Implement method
        return null;
    }

    public Optional<Receipt> getReceiptById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Receipt createReceipt(Receipt receipt) {
        // TODO: Implement method
        return null;
    }

    public Receipt updateReceipt(UUID id, Receipt receipt) {
        // TODO: Implement method
        return null;
    }

    public void deleteReceipt(UUID id) {
        // TODO: Implement method
    }
}
