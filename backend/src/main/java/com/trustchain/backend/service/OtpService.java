package com.trustchain.backend.service;

import com.trustchain.backend.dto.OtpVerifyResponse;
import com.trustchain.backend.model.OtpToken;
import com.trustchain.backend.repository.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.UUID;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${otp.delivery.mode:email}")
    private String deliveryMode;

    @Value("${otp.delivery.fallback-to-log:false}")
    private boolean fallbackToLog;

    @Value("${otp.validity.seconds:300}")
    private long otpValiditySeconds;

    @Value("${otp.cooldown.seconds:30}")
    private long otpCooldownSeconds;

    @Value("${otp.max.attempts:5}")
    private int maxAttempts;

    @Value("${otp.verification-token.validity.seconds:600}")
    private long verificationTokenValiditySeconds;

    @Transactional
    public void generateAndSendOtp(String emailRaw) {
        String email = normalizeEmail(emailRaw);
        if (email.isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        LocalDateTime now = LocalDateTime.now();
        otpTokenRepository.findTopByEmailOrderByCreatedAtDesc(email).ifPresent(last -> {
            if (last.getCreatedAt() != null && now.isBefore(last.getCreatedAt().plusSeconds(otpCooldownSeconds))) {
                long waitSeconds = Duration.between(now, last.getCreatedAt().plusSeconds(otpCooldownSeconds)).getSeconds();
                throw new IllegalStateException("Please wait " + Math.max(1, waitSeconds) + " seconds before requesting a new OTP");
            }
        });

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        OtpToken token = new OtpToken();
        token.setEmail(email);
        token.setOtpHash(passwordEncoder.encode(otp));
        token.setCreatedAt(now);
        token.setExpiresAt(now.plusSeconds(otpValiditySeconds));
        token.setAttemptCount(0);
        otpTokenRepository.save(token);

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

    @Transactional
    public OtpVerifyResponse verifyOtp(String emailRaw, String otpRaw) {
        String email = normalizeEmail(emailRaw);
        String otp = otpRaw != null ? otpRaw.trim() : "";
        if (email.isEmpty() || otp.isEmpty()) {
            return new OtpVerifyResponse(false, "Email and OTP are required", null, 0L, "INVALID_REQUEST");
        }

        LocalDateTime now = LocalDateTime.now();
        OtpToken token = otpTokenRepository.findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(email).orElse(null);
        if (token == null) {
            return new OtpVerifyResponse(false, "No OTP request found for this email. Please send OTP again.", null, 0L, "NOT_FOUND");
        }

        if (token.getExpiresAt() != null && now.isAfter(token.getExpiresAt())) {
            return new OtpVerifyResponse(false, "OTP expired. Please resend OTP.", null, 0L, "EXPIRED");
        }

        int attempts = token.getAttemptCount() != null ? token.getAttemptCount() : 0;
        if (attempts >= maxAttempts) {
            return new OtpVerifyResponse(false, "Too many attempts. Please request a new OTP.", null, 0L, "TOO_MANY_ATTEMPTS");
        }

        boolean matches = token.getOtpHash() != null && passwordEncoder.matches(otp, token.getOtpHash());
        token.setAttemptCount(attempts + 1);
        token.setLastAttemptAt(now);

        if (!matches) {
            otpTokenRepository.save(token);
            return new OtpVerifyResponse(false, "Incorrect OTP. Please try again.", null, 0L, "INVALID");
        }

        String verificationToken = UUID.randomUUID().toString().replace("-", "");
        token.setConsumedAt(now);
        token.setVerificationToken(verificationToken);
        token.setVerificationTokenExpiresAt(now.plusSeconds(verificationTokenValiditySeconds));
        token.setVerificationTokenConsumedAt(null);
        otpTokenRepository.save(token);

        return new OtpVerifyResponse(true, "OTP verified successfully", verificationToken, verificationTokenValiditySeconds, "VERIFIED");
    }

    @Transactional
    public boolean consumeVerificationToken(String emailRaw, String verificationTokenRaw) {
        String email = normalizeEmail(emailRaw);
        String verificationToken = verificationTokenRaw != null ? verificationTokenRaw.trim() : "";
        if (email.isEmpty() || verificationToken.isEmpty()) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        OtpToken token = otpTokenRepository.findTopByEmailAndVerificationTokenOrderByCreatedAtDesc(email, verificationToken).orElse(null);
        if (token == null) {
            return false;
        }
        if (token.getVerificationTokenConsumedAt() != null) {
            return false;
        }
        if (token.getVerificationTokenExpiresAt() != null && now.isAfter(token.getVerificationTokenExpiresAt())) {
            return false;
        }

        token.setVerificationTokenConsumedAt(now);
        otpTokenRepository.save(token);
        return true;
    }

    private static String normalizeEmail(String emailRaw) {
        if (emailRaw == null) return "";
        return emailRaw.trim().toLowerCase();
    }
}
