package com.trustchain.backend.controller;

import com.trustchain.backend.dto.OtpSendRequest;
import com.trustchain.backend.dto.OtpVerifyRequest;
import com.trustchain.backend.dto.OtpVerifyResponse;
import com.trustchain.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "http://localhost:3000")
public class OtpController {

    private static final Logger log = LoggerFactory.getLogger(OtpController.class);

    @Autowired
    private OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody OtpSendRequest request) {
        String email = request.getEmail();
        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok("OTP sent successfully");
        } catch (Exception e) {
            log.error("Failed to send OTP to {}", email, e);
            String msg = extractMeaningfulMessage(e);
            HttpStatus status = msg != null && msg.toLowerCase().contains("please wait") ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.INTERNAL_SERVER_ERROR;
            return ResponseEntity.status(status).body("Failed to send OTP: " + msg);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        OtpVerifyResponse response = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (response.isVerified()) {
            return ResponseEntity.ok(response);
        }
        if ("TOO_MANY_ATTEMPTS".equalsIgnoreCase(response.getCode())) {
            return ResponseEntity.status(429).body(response);
        }
        if ("INVALID_REQUEST".equalsIgnoreCase(response.getCode())) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.status(401).body(response);
    }

    private static String extractMeaningfulMessage(Throwable t) {
        Throwable cur = t;
        String lastMessage = null;
        while (cur != null) {
            if (cur.getMessage() != null && !cur.getMessage().isBlank()) {
                lastMessage = cur.getMessage();
            }
            cur = cur.getCause();
        }
        return lastMessage != null ? lastMessage : t.getClass().getSimpleName();
    }
}
