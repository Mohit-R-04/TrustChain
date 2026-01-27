package com.trustchain.backend.controller;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    @GetMapping("/dashboard")
    @RequireRole(UserRole.VENDOR)
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Vendor Dashboard");
        response.put("userId", authentication.getName());
        response.put("role", "VENDOR");
        response.put("stats", Map.of(
                "activeOrders", 0,
                "totalRevenue", 0,
                "pendingPayments", 0));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/invoices")
    @RequireRole(UserRole.VENDOR)
    public ResponseEntity<Map<String, String>> submitInvoice(
            @RequestBody Map<String, Object> invoiceData,
            Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Invoice submitted successfully");
        response.put("vendorId", authentication.getName());
        response.put("status", "pending_verification");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders")
    @RequireRole(UserRole.VENDOR)
    public ResponseEntity<Map<String, Object>> getOrders(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", authentication.getName());
        response.put("orders", new Object[] {});
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payments")
    @RequireRole(UserRole.VENDOR)
    public ResponseEntity<Map<String, Object>> getPayments(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", authentication.getName());
        response.put("payments", new Object[] {});
        return ResponseEntity.ok(response);
    }
}
