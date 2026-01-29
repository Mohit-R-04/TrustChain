package com.trustchain.backend.controller;

import com.trustchain.backend.dto.DecisionRequest;
import com.trustchain.backend.model.Invoice;
import com.trustchain.backend.service.InvoiceService;
import com.trustchain.backend.security.JwtTokenValidator;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private JwtTokenValidator jwtTokenValidator;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/visible")
    public ResponseEntity<List<Invoice>> getVisibleInvoices(Authentication authentication) {
        if (hasAuthority(authentication, "ROLE_VENDOR")) {
            return ResponseEntity.ok(invoiceService.getInvoicesByVendorUserId(authentication.getName()));
        }
        if (hasAuthority(authentication, "ROLE_NGO")) {
            return ResponseEntity.ok(invoiceService.getInvoicesByNgoUserId(authentication.getName()));
        }
        if (hasAuthority(authentication, "ROLE_GOVERNMENT")) {
            return ResponseEntity.ok(invoiceService.getInvoicesByGovernmentUserId(authentication.getName()));
        }
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Invoice>> getInvoicesByVendorUserId(@PathVariable String userId, Authentication authentication) {
        return ResponseEntity.ok(invoiceService.getInvoicesByVendorUserId(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable UUID id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        // Ensure created_at is set
        if (invoice.getCreatedAt() == null) {
            invoice.setCreatedAt(java.time.LocalDateTime.now());
        }
        return ResponseEntity.ok(invoiceService.createInvoice(invoice));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Invoice> uploadInvoice(
            @RequestParam UUID manageId,
            @RequestParam Double amount,
            @RequestPart("file") MultipartFile file,
            HttpServletRequest httpRequest
    ) {
        String token = extractBearerTokenOrQueryToken(httpRequest);
        if (token == null || token.isBlank() || !jwtTokenValidator.validateToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid authorization token");
        }
        String vendorUserId = jwtTokenValidator.getUserIdFromToken(token);
        if (vendorUserId == null || vendorUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authorization token");
        }

        try {
            Invoice created = invoiceService.uploadInvoiceAndCreate(
                    vendorUserId,
                    manageId,
                    amount,
                    file.getBytes(),
                    file.getOriginalFilename(),
                    file.getContentType()
            );
            return ResponseEntity.ok(created);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid invoice file");
        }
    }

    @PatchMapping("/{id}/ngo/decision")
    public ResponseEntity<Invoice> ngoDecision(@PathVariable UUID id, @RequestBody DecisionRequest request, Authentication authentication) {
        return ResponseEntity.ok(invoiceService.ngoDecision(id, request.getDecision(), authentication.getName()));
    }

    @PatchMapping("/{id}/government/decision")
    public ResponseEntity<Invoice> governmentDecision(@PathVariable UUID id, @RequestBody DecisionRequest request, Authentication authentication) {
        return ResponseEntity.ok(invoiceService.governmentDecision(id, request.getDecision(), authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable UUID id, @RequestBody Invoice invoice) {
        Invoice updatedInvoice = invoiceService.updateInvoice(id, invoice);
        return updatedInvoice != null ? ResponseEntity.ok(updatedInvoice) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(authority));
    }

    private String extractBearerTokenOrQueryToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return request.getParameter("authToken");
    }
}
