package com.trustchain.backend.service;

import com.trustchain.backend.dto.AadhaarVerificationRequest;
import com.trustchain.backend.dto.AadhaarVerificationResponse;
import com.trustchain.backend.dto.KycRecordResponse;
import com.trustchain.backend.model.KycRecord;
import com.trustchain.backend.repository.KycRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

    private final KycRecordRepository kycRecordRepository;
    private final ApiSetuService apiSetuService;

    @Transactional
    public AadhaarVerificationResponse verifyAndSaveKyc(AadhaarVerificationRequest request, String vendorId) {
        log.info("Processing KYC verification for Aadhaar for vendor: {}", vendorId);

        // Check if vendor already has KYC
        if (kycRecordRepository.existsByVendorId(vendorId)) {
            log.warn("Vendor already has KYC record");
            return AadhaarVerificationResponse.builder()
                    .success(false)
                    .message("Vendor already has a KYC record")
                    .status("DUPLICATE_VENDOR")
                    .build();
        }

        // Check if Aadhaar already used
        if (kycRecordRepository.existsByAadhaarNumber(request.getAadhaarNumber())) {
            log.warn("Aadhaar already verified");
            return AadhaarVerificationResponse.builder()
                    .success(false)
                    .message("Aadhaar already verified")
                    .status("DUPLICATE_AADHAAR")
                    .build();
        }

        // Verify with API Setu
        AadhaarVerificationResponse response = apiSetuService.verifyAadhaar(request);

        // Save to database
        KycRecord record = KycRecord.builder()
                .vendorId(vendorId)
                .aadhaarNumber(request.getAadhaarNumber())
                .name(response.getName())
                .dateOfBirth(response.getDateOfBirth())
                .gender(response.getGender())
                .address(response.getAddress())
                .status(response.isSuccess() ? KycRecord.VerificationStatus.VERIFIED
                        : KycRecord.VerificationStatus.FAILED)
                .verificationResponse(response.getMessage())
                .build();

        kycRecordRepository.save(record);
        log.info("KYC record saved successfully");

        return response;
    }

    public List<KycRecordResponse> getAllKycRecords() {
        return kycRecordRepository.findAll().stream()
                .map(KycRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public KycRecordResponse getKycRecordById(Long id) {
        KycRecord record = kycRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KYC record not found"));
        return KycRecordResponse.fromEntity(record);
    }

    public KycRecordResponse getKycRecordByAadhaar(String aadhaarNumber) {
        KycRecord record = kycRecordRepository.findByAadhaarNumber(aadhaarNumber)
                .orElseThrow(() -> new RuntimeException("KYC record not found"));
        return KycRecordResponse.fromEntity(record);
    }

    public KycRecordResponse getKycRecordByVendorId(String vendorId) {
        KycRecord record = kycRecordRepository.findByVendorId(vendorId)
                .orElseThrow(() -> new RuntimeException("KYC record not found for vendor"));
        return KycRecordResponse.fromEntity(record);
    }
}
