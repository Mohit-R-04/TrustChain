package com.trustchain.backend.service;

import com.trustchain.backend.dto.PanVerificationRequest;
import com.trustchain.backend.dto.PanVerificationResponse;
import com.trustchain.backend.dto.PanRecordResponse;
import com.trustchain.backend.model.PanRecord;
import com.trustchain.backend.repository.PanRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PanService {

    private final PanRecordRepository panRecordRepository;
    private final ApiSetuPanService apiSetuPanService;

    @Transactional
    public PanVerificationResponse verifyAndSavePan(PanVerificationRequest request, String vendorId) {
        log.info("Processing PAN verification for vendor: {}", vendorId);

        // Check if vendor already has PAN
        if (panRecordRepository.existsByVendorId(vendorId)) {
            log.warn("Vendor already has PAN record");
            return PanVerificationResponse.builder()
                    .success(false)
                    .message("Vendor already has a PAN record")
                    .status("DUPLICATE_VENDOR")
                    .build();
        }

        // Check if PAN already verified globally
        if (panRecordRepository.existsByPanNumber(request.getPanNumber())) {
            log.warn("PAN already verified");
            return PanVerificationResponse.builder()
                    .success(false)
                    .message("PAN already verified")
                    .status("DUPLICATE_PAN")
                    .build();
        }

        // Verify with API Setu
        PanVerificationResponse response = apiSetuPanService.verifyPan(request);

        // Save to database
        PanRecord record = PanRecord.builder()
                .vendorId(vendorId)
                .panNumber(request.getPanNumber())
                .name(response.getName())
                .dateOfBirth(response.getDateOfBirth())
                .fatherName(response.getFatherName())
                .category(response.getCategory())
                .status(response.isSuccess() ? PanRecord.VerificationStatus.VERIFIED
                        : PanRecord.VerificationStatus.FAILED)
                .verificationResponse(response.getMessage())
                .build();

        panRecordRepository.save(record);
        log.info("PAN record saved successfully");

        return response;
    }

    public List<PanRecordResponse> getAllPanRecords() {
        return panRecordRepository.findAll().stream()
                .map(PanRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PanRecordResponse getPanRecordById(Long id) {
        PanRecord record = panRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PAN record not found"));
        return PanRecordResponse.fromEntity(record);
    }

    public PanRecordResponse getPanRecordByPanNumber(String panNumber) {
        PanRecord record = panRecordRepository.findByPanNumber(panNumber)
                .orElseThrow(() -> new RuntimeException("PAN record not found"));
        return PanRecordResponse.fromEntity(record);
    }

    public PanRecordResponse getPanRecordByVendorId(String vendorId) {
        PanRecord record = panRecordRepository.findByVendorId(vendorId)
                .orElseThrow(() -> new RuntimeException("PAN record not found for vendor"));
        return PanRecordResponse.fromEntity(record);
    }
}
