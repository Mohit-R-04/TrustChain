package com.trustchain.backend.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    public boolean processPayment(Double amount, String currency, String token) {
        // Simulate Stripe payment processing
        // In a real application, this would interact with Stripe API
        
        // Simulate success for now (80% success rate or always success for demo)
        return true; 
    }

    public String generateTransactionReference() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
