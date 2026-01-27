package com.trustchain.backend.service;

import com.trustchain.backend.model.Transaction;
import com.trustchain.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        // TODO: Implement method
        return null;
    }

    public Optional<Transaction> getTransactionById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Transaction createTransaction(Transaction transaction) {
        // TODO: Implement method
        return null;
    }

    public Transaction updateTransaction(UUID id, Transaction transaction) {
        // TODO: Implement method
        return null;
    }

    public void deleteTransaction(UUID id) {
        // TODO: Implement method
    }
}
