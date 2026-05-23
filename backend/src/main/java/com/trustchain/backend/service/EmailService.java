package com.trustchain.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${otp.validity.seconds:300}")
    private long otpValiditySeconds;

    public void sendOtpEmail(String toEmail, String otp) {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("Email sender is not configured. Set MAIL_USERNAME and MAIL_PASSWORD in environment.");
        }
        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("TrustChain Verification OTP");

            String htmlContent = getOtpHtmlTemplate(otp, formatDuration(otpValiditySeconds));
            helper.setText(htmlContent, true); // true indicates HTML content

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send HTML OTP email", e);
        }
    }

    private static String formatDuration(long seconds) {
        if (seconds <= 60) {
            return seconds + " seconds";
        }
        long minutes = seconds / 60;
        long rem = seconds % 60;
        if (rem == 0) {
            return minutes + " minutes";
        }
        return minutes + " minutes " + rem + " seconds";
    }

    private static String getOtpHtmlTemplate(String otp, String validityDuration) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"utf-8\">\n" +
                "  <style>\n" +
                "    body {\n" +
                "      font-family: 'Inter', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n" +
                "      background-color: #0f172a;\n" +
                "      color: #f1f5f9;\n" +
                "      margin: 0;\n" +
                "      padding: 0;\n" +
                "    }\n" +
                "    .container {\n" +
                "      max-width: 600px;\n" +
                "      margin: 40px auto;\n" +
                "      background-color: #1e293b;\n" +
                "      border-radius: 16px;\n" +
                "      border: 1px solid rgba(255, 255, 255, 0.05);\n" +
                "      overflow: hidden;\n" +
                "      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);\n" +
                "    }\n" +
                "    .header {\n" +
                "      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);\n" +
                "      padding: 30px;\n" +
                "      text-align: center;\n" +
                "    }\n" +
                "    .header h1 {\n" +
                "      margin: 0;\n" +
                "      color: #ffffff;\n" +
                "      font-size: 28px;\n" +
                "      font-weight: 800;\n" +
                "      letter-spacing: -0.5px;\n" +
                "    }\n" +
                "    .content {\n" +
                "      padding: 40px 30px;\n" +
                "      text-align: center;\n" +
                "    }\n" +
                "    .intro {\n" +
                "      font-size: 16px;\n" +
                "      line-height: 1.6;\n" +
                "      color: #cbd5e1;\n" +
                "      margin-bottom: 30px;\n" +
                "    }\n" +
                "    .otp-box {\n" +
                "      background-color: #0f172a;\n" +
                "      border: 1px solid rgba(255, 255, 255, 0.1);\n" +
                "      border-radius: 12px;\n" +
                "      padding: 20px;\n" +
                "      margin: 20px auto;\n" +
                "      max-width: 250px;\n" +
                "    }\n" +
                "    .otp-code {\n" +
                "      font-size: 36px;\n" +
                "      font-weight: 800;\n" +
                "      color: #38bdf8;\n" +
                "      letter-spacing: 6px;\n" +
                "      font-family: monospace;\n" +
                "      margin: 0;\n" +
                "    }\n" +
                "    .validity {\n" +
                "      font-size: 14px;\n" +
                "      color: #94a3b8;\n" +
                "      margin-top: 25px;\n" +
                "      line-height: 1.5;\n" +
                "    }\n" +
                "    .footer {\n" +
                "      background-color: #0f172a;\n" +
                "      padding: 20px 30px;\n" +
                "      text-align: center;\n" +
                "      border-top: 1px solid rgba(255, 255, 255, 0.05);\n" +
                "    }\n" +
                "    .footer p {\n" +
                "      margin: 0;\n" +
                "      font-size: 12px;\n" +
                "      color: #64748b;\n" +
                "      line-height: 1.5;\n" +
                "    }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"container\">\n" +
                "    <div class=\"header\">\n" +
                "      <h1>TrustChain</h1>\n" +
                "    </div>\n" +
                "    <div class=\"content\">\n" +
                "      <p class=\"intro\">To complete your action and verify your email, please use the following One-Time Password (OTP):</p>\n" +
                "      <div class=\"otp-box\">\n" +
                "        <p class=\"otp-code\">" + otp + "</p>\n" +
                "      </div>\n" +
                "      <p class=\"validity\">This OTP is valid for <strong>" + validityDuration + "</strong>. Please do not share this code with anyone.</p>\n" +
                "    </div>\n" +
                "    <div class=\"footer\">\n" +
                "      <p>Secured by Blockchain • Built for Transparency</p>\n" +
                "      <p style=\"margin-top: 5px;\">© 2026 TrustChain. All rights reserved.</p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
