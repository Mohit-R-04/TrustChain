package com.trustchain.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${mail.from:trustchain.otp.noreply@gmail.com}")
    private String fromEmail;

    @Value("${mail.from.name:TrustChain}")
    private String fromName;

    @Value("${otp.validity.seconds:300}")
    private long otpValiditySeconds;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public void sendOtpEmail(String toEmail, String otp) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException("Brevo API key is not configured. Set BREVO_API_KEY in environment.");
        }
        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        try {
            String htmlContent = getOtpHtmlTemplate(otp, formatDuration(otpValiditySeconds));

            // Construct payload for Brevo transactional email
            Map<String, Object> payload = Map.of(
                "sender", Map.of("name", fromName, "email", fromEmail),
                "to", List.of(Map.of("email", toEmail)),
                "subject", "🔑 TrustChain — Your Verification Code",
                "htmlContent", htmlContent
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            log.info("Sending OTP email to {} via Brevo REST API...", toEmail);
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("OTP email successfully sent to {}. Response: {}", toEmail, response.body());
            } else {
                log.error("Failed to send OTP email via Brevo REST API. HTTP Code: {}, Response: {}", 
                        response.statusCode(), response.body());
                throw new RuntimeException("Brevo API returned error status: " + response.statusCode() + " - " + response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email", e);
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
