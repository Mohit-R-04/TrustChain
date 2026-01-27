package com.trustchain.backend.controller;

import com.trustchain.backend.dto.AadhaarVerificationRequest;
import com.trustchain.backend.dto.AadhaarVerificationResponse;
import com.trustchain.backend.dto.KycRecordResponse;
import com.trustchain.backend.service.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class KycController {

    private final KycService kycService;

    @PostMapping("/{vendorId}/verify")
    public ResponseEntity<AadhaarVerificationResponse> verifyAadhaar(
            @PathVariable String vendorId,
            @Valid @RequestBody AadhaarVerificationRequest request) {
        log.info("Received Aadhaar verification request for vendor: {}", vendorId);
        AadhaarVerificationResponse response = kycService.verifyAndSaveKyc(request, vendorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{vendorId}/record")
    public ResponseEntity<KycRecordResponse> getRecordByVendorId(@PathVariable String vendorId) {
        log.info("Fetching KYC record for vendor: {}", vendorId);
        try {
            KycRecordResponse record = kycService.getKycRecordByVendorId(vendorId);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/records")
    public ResponseEntity<List<KycRecordResponse>> getAllRecords() {
        log.info("Fetching all KYC records");
        List<KycRecordResponse> records = kycService.getAllKycRecords();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/records/aadhaar/{aadhaarNumber}")
    public ResponseEntity<KycRecordResponse> getRecordByAadhaar(
            @PathVariable String aadhaarNumber) {
        log.info("Fetching KYC record by Aadhaar");
        KycRecordResponse record = kycService.getKycRecordByAadhaar(aadhaarNumber);
        return ResponseEntity.ok(record);
    }
}
