package com.trustchain.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Map;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    @Autowired
    private EmailService emailService;

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private static final long OTP_VALID_DURATION_SECONDS = 30;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${otp.delivery.mode:email}")
    private String deliveryMode;

    @Value("${otp.delivery.fallback-to-log:false}")
    private boolean fallbackToLog;

    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusSeconds(OTP_VALID_DURATION_SECONDS));
        otpStorage.put(email, otpData);
        if ("log".equalsIgnoreCase(deliveryMode)) {
            log.info("OTP for {} is {}", email, otp);
            return;
        }

        try {
            emailService.sendOtpEmail(email, otp);
        } catch (RuntimeException ex) {
            if (fallbackToLog) {
                log.warn("OTP email send failed; falling back to log delivery for {}", email, ex);
                log.info("OTP for {} is {}", email, otp);
                return;
            }
            throw ex;
        }
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
