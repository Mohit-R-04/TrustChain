package com.trustchain.backend.dto;

public class InvoiceChangeRequestDto {
    private String reason;

    public InvoiceChangeRequestDto() {
    }

    public InvoiceChangeRequestDto(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

