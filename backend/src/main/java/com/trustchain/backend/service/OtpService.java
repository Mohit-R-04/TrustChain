package com.trustchain.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private EmailService emailService;

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private static final long OTP_VALID_DURATION_SECONDS = 30;

    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusSeconds(OTP_VALID_DURATION_SECONDS));
        otpStorage.put(email, otpData);
        emailService.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData otpData = otpStorage.get(email);
        if (otpData == null) {
            return false;
        }
        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            otpStorage.remove(email);
            return false;
        }
        if (otpData.otp.equals(otp)) {
            otpStorage.remove(email); // Invalidate after successful use
            return true;
        }
        return false;
    }

    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;

        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
