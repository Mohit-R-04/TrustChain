package com.trustchain.backend.service;

import com.trustchain.backend.dto.OtpVerifyResponse;
import com.trustchain.backend.model.OtpToken;
import com.trustchain.backend.repository.OtpTokenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class OtpServiceTest {

    @Test
    void generateAndSendOtp_sendsEmail_andIssuesVerificationToken() {
        EmailService emailService = mock(EmailService.class);
        OtpTokenRepository otpTokenRepository = mock(OtpTokenRepository.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        AtomicReference<OtpToken> stored = new AtomicReference<>();
        when(otpTokenRepository.save(any(OtpToken.class))).thenAnswer(invocation -> {
            OtpToken t = invocation.getArgument(0, OtpToken.class);
            stored.set(t);
            return t;
        });
        when(otpTokenRepository.findTopByEmailOrderByCreatedAtDesc(anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(stored.get()));
        when(otpTokenRepository.findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(anyString()))
                .thenAnswer(invocation -> {
                    OtpToken t = stored.get();
                    if (t == null || t.getConsumedAt() != null) {
                        return Optional.empty();
                    }
                    return Optional.of(t);
                });
        when(otpTokenRepository.findTopByEmailAndVerificationTokenOrderByCreatedAtDesc(anyString(), anyString()))
                .thenAnswer(invocation -> {
                    String token = invocation.getArgument(1, String.class);
                    OtpToken t = stored.get();
                    if (t == null || t.getVerificationToken() == null || !t.getVerificationToken().equals(token)) {
                        return Optional.empty();
                    }
                    return Optional.of(t);
                });

        OtpService otpService = new OtpService();
        ReflectionTestUtils.setField(otpService, "emailService", emailService);
        ReflectionTestUtils.setField(otpService, "otpTokenRepository", otpTokenRepository);
        ReflectionTestUtils.setField(otpService, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(otpService, "deliveryMode", "email");
        ReflectionTestUtils.setField(otpService, "fallbackToLog", false);
        ReflectionTestUtils.setField(otpService, "otpValiditySeconds", 300L);
        ReflectionTestUtils.setField(otpService, "otpCooldownSeconds", 0L);
        ReflectionTestUtils.setField(otpService, "maxAttempts", 5);
        ReflectionTestUtils.setField(otpService, "verificationTokenValiditySeconds", 600L);

        String email = "user@example.com";
        final String[] capturedOtp = new String[1];
        doAnswer(invocation -> {
            capturedOtp[0] = invocation.getArgument(1, String.class);
            return null;
        }).when(emailService).sendOtpEmail(eq(email), anyString());

        otpService.generateAndSendOtp(email);

        verify(emailService, times(1)).sendOtpEmail(eq(email), anyString());
        OtpVerifyResponse verifyResponse = otpService.verifyOtp(email, capturedOtp[0]);
        assertTrue(verifyResponse.isVerified());
        assertNotNull(verifyResponse.getVerificationToken());

        assertTrue(otpService.consumeVerificationToken(email, verifyResponse.getVerificationToken()));
        assertFalse(otpService.consumeVerificationToken(email, verifyResponse.getVerificationToken()));
    }

    @Test
    void generateAndSendOtp_inLogMode_doesNotSendEmail() {
        EmailService emailService = mock(EmailService.class);
        OtpTokenRepository otpTokenRepository = mock(OtpTokenRepository.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        when(otpTokenRepository.save(any(OtpToken.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(otpTokenRepository.findTopByEmailOrderByCreatedAtDesc(anyString())).thenReturn(Optional.empty());

        OtpService otpService = new OtpService();
        ReflectionTestUtils.setField(otpService, "emailService", emailService);
        ReflectionTestUtils.setField(otpService, "otpTokenRepository", otpTokenRepository);
        ReflectionTestUtils.setField(otpService, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(otpService, "deliveryMode", "log");
        ReflectionTestUtils.setField(otpService, "fallbackToLog", false);
        ReflectionTestUtils.setField(otpService, "otpValiditySeconds", 300L);
        ReflectionTestUtils.setField(otpService, "otpCooldownSeconds", 0L);

        otpService.generateAndSendOtp("user@example.com");

        verifyNoInteractions(emailService);
    }
}
