package com.trustchain.backend.dto;

import com.trustchain.backend.model.KycRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycRecordResponse {

    private Long id;
    private String vendorId;
    private String aadhaarNumber;
    private String name;
    private String dateOfBirth;
    private String gender;
    private String address;
    private String mobileNumber;
    private String email;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static KycRecordResponse fromEntity(KycRecord record) {
        return KycRecordResponse.builder()
                .id(record.getId())
                .vendorId(record.getVendorId())
                .aadhaarNumber(maskAadhaar(record.getAadhaarNumber()))
                .name(record.getName())
                .dateOfBirth(record.getDateOfBirth())
                .gender(record.getGender())
                .address(record.getAddress())
                .mobileNumber(record.getMobileNumber())
                .email(record.getEmail())
                .status(record.getStatus().name())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    private static String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() != 12) {
            return aadhaar;
        }
        return "XXXX-XXXX-" + aadhaar.substring(8);
    }
}
