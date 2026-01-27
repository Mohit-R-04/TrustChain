package com.trustchain.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PanVerificationResponse {

    private boolean success;
    private String message;
    private String panNumber;
    private String name;
    private String dateOfBirth;
    private String fatherName;
    private String category;
    private String status;
    private String referenceId;
}
