package com.trustchain.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AadhaarVerificationResponse {

    private boolean success;
    private String message;
    private String aadhaarNumber;
    private String name;
    private String dateOfBirth;
    private String gender;
    private String address;
    private String status;
    private String referenceId;
}
