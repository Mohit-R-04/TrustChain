package com.trustchain.backend.controller;

import com.trustchain.backend.dto.PanVerificationRequest;
import com.trustchain.backend.dto.PanVerificationResponse;
import com.trustchain.backend.dto.PanRecordResponse;
import com.trustchain.backend.service.PanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pan")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PanController {

    private final PanService panService;

    @PostMapping("/{vendorId}/verify")
    public ResponseEntity<PanVerificationResponse> verifyPan(
            @PathVariable String vendorId,
            @Valid @RequestBody PanVerificationRequest request) {
        log.info("Received PAN verification request for vendor: {}", vendorId);
        PanVerificationResponse response = panService.verifyAndSavePan(request, vendorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{vendorId}/record")
    public ResponseEntity<PanRecordResponse> getRecordByVendorId(@PathVariable String vendorId) {
        log.info("Fetching PAN record for vendor: {}", vendorId);
        try {
            PanRecordResponse record = panService.getPanRecordByVendorId(vendorId);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/records")
    public ResponseEntity<List<PanRecordResponse>> getAllRecords() {
        log.info("Fetching all PAN records");
        List<PanRecordResponse> records = panService.getAllPanRecords();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/records/pan/{panNumber}")
    public ResponseEntity<PanRecordResponse> getRecordByPan(
            @PathVariable String panNumber) {
        log.info("Fetching PAN record by PAN number");
        PanRecordResponse record = panService.getPanRecordByPanNumber(panNumber);
        return ResponseEntity.ok(record);
    }
}
