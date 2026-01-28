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
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByVendorUserId(String userId) {
        return transactionRepository.findByVendor_UserId(userId);
    }

    public Optional<Transaction> getTransactionById(UUID id) {
        return transactionRepository.findById(id);
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(UUID id, Transaction transaction) {
        if (transactionRepository.existsById(id)) {
            transaction.setTransactionId(id);
            return transactionRepository.save(transaction);
        }
        return null;
    }

    public void deleteTransaction(UUID id) {
        transactionRepository.deleteById(id);
    }
}
