package com.trustchain.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("Email sender is not configured. Set MAIL_USERNAME and MAIL_PASSWORD (Gmail App Password) in environment or backend/.env.");
        }
        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("TrustChain Verification OTP");
        message.setText("Your OTP for posting a community need is: " + otp + "\n\nThis OTP is valid for 30 seconds.");

        mailSender.send(message);
    }
}
