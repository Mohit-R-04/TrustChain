package com.trustchain.backend.dto;

import com.trustchain.backend.model.PanRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PanRecordResponse {

    private Long id;
    private String vendorId;
    private String panNumber;
    private String name;
    private String dateOfBirth;
    private String fatherName;
    private String category;
    private String mobileNumber;
    private String email;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PanRecordResponse fromEntity(PanRecord record) {
        return PanRecordResponse.builder()
                .id(record.getId())
                .vendorId(record.getVendorId())
                .panNumber(maskPan(record.getPanNumber()))
                .name(record.getName())
                .dateOfBirth(record.getDateOfBirth())
                .fatherName(record.getFatherName())
                .category(record.getCategory())
                .mobileNumber(record.getMobileNumber())
                .email(record.getEmail())
                .status(record.getStatus().name())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    private static String maskPan(String pan) {
        if (pan == null || pan.length() != 10) {
            return pan;
        }
        return "XXXXX" + pan.substring(5, 9) + "X";
    }
}
