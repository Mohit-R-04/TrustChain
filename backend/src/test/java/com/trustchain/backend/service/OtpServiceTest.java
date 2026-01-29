package com.trustchain.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class OtpServiceTest {

    @Test
    void generateAndSendOtp_sendsEmail_andVerifiesOnce() {
        EmailService emailService = mock(EmailService.class);
        OtpService otpService = new OtpService();
        ReflectionTestUtils.setField(otpService, "emailService", emailService);
        ReflectionTestUtils.setField(otpService, "deliveryMode", "email");
        ReflectionTestUtils.setField(otpService, "fallbackToLog", false);

        String email = "user@example.com";
        final String[] capturedOtp = new String[1];
        doAnswer(invocation -> {
            capturedOtp[0] = invocation.getArgument(1, String.class);
            return null;
        }).when(emailService).sendOtpEmail(eq(email), anyString());

        otpService.generateAndSendOtp(email);

        verify(emailService, times(1)).sendOtpEmail(eq(email), anyString());
        assertTrue(otpService.verifyOtp(email, capturedOtp[0]));
        assertFalse(otpService.verifyOtp(email, capturedOtp[0]));
    }

    @Test
    void generateAndSendOtp_inLogMode_doesNotSendEmail() {
        EmailService emailService = mock(EmailService.class);
        OtpService otpService = new OtpService();
        ReflectionTestUtils.setField(otpService, "emailService", emailService);
        ReflectionTestUtils.setField(otpService, "deliveryMode", "log");
        ReflectionTestUtils.setField(otpService, "fallbackToLog", false);

        otpService.generateAndSendOtp("user@example.com");

        verifyNoInteractions(emailService);
    }
}

