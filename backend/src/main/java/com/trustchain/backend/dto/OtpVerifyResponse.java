package com.trustchain.backend.dto;

public class OtpVerifyResponse {

    private boolean verified;
    private String message;
    private String verificationToken;
    private long verificationExpiresInSeconds;
    private String code;

    public OtpVerifyResponse() {
    }

    public OtpVerifyResponse(boolean verified, String message, String verificationToken, long verificationExpiresInSeconds, String code) {
        this.verified = verified;
        this.message = message;
        this.verificationToken = verificationToken;
        this.verificationExpiresInSeconds = verificationExpiresInSeconds;
        this.code = code;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public long getVerificationExpiresInSeconds() {
        return verificationExpiresInSeconds;
    }

    public void setVerificationExpiresInSeconds(long verificationExpiresInSeconds) {
        this.verificationExpiresInSeconds = verificationExpiresInSeconds;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
