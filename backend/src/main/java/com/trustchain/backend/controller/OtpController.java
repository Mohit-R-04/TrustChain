package com.trustchain.backend.controller;

import com.trustchain.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
@CrossOrigin(origins = "http://localhost:3000")
public class OtpController {

    @Autowired
    private OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }
        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok("OTP verified successfully");
        } else {
            return ResponseEntity.status(401).body("Invalid or expired OTP");
        }
    }
}
