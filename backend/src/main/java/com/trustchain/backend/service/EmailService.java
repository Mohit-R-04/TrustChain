package com.trustchain.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("trustchain.noreply@gmail.com");
            message.setTo(toEmail);
            message.setSubject("TrustChain Verification OTP");
            message.setText("Your OTP for posting a community need is: " + otp + "\n\nThis OTP is valid for 30 seconds.");

            mailSender.send(message);
            System.out.println("OTP email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Error sending OTP email: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to handle in controller
        }
    }
}
