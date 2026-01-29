package com.trustchain.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustchain.backend.security.SvixWebhookVerifier;
import com.trustchain.backend.service.ClerkEnforcementService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/webhooks")
public class ClerkWebhookController {

    private final ObjectMapper objectMapper;
    private final ClerkEnforcementService clerkEnforcementService;
    private final String webhookSecret;

    public ClerkWebhookController(
            ObjectMapper objectMapper,
            ClerkEnforcementService clerkEnforcementService,
            @Value("${clerk.webhook.secret:}") String webhookSecret) {
        this.objectMapper = objectMapper;
        this.clerkEnforcementService = clerkEnforcementService;
        this.webhookSecret = webhookSecret != null ? webhookSecret.trim() : "";
    }

    @PostMapping("/clerk")
    public ResponseEntity<?> handleClerkWebhook(HttpServletRequest request) throws IOException {
        if (webhookSecret.isEmpty()) {
            return ResponseEntity.status(500).body("{\"error\":\"Webhook secret not configured\"}");
        }

        String msgId = firstHeader(request, "svix-id", "webhook-id");
        String timestamp = firstHeader(request, "svix-timestamp", "webhook-timestamp");
        String signature = firstHeader(request, "svix-signature", "webhook-signature");

        String payload = readRawBody(request);

        boolean ok = SvixWebhookVerifier.verify(webhookSecret, msgId, timestamp, signature, payload);
        if (!ok) {
            return ResponseEntity.badRequest().body("{\"error\":\"Invalid webhook signature\"}");
        }

        JsonNode root = objectMapper.readTree(payload);
        String type = text(root, "type");
        JsonNode data = root.get("data");

        if ("session.created".equals(type)) {
            clerkEnforcementService.enforceForSessionCreated(data);
        }

        return ResponseEntity.ok("{\"ok\":true}");
    }

    private static String readRawBody(HttpServletRequest request) throws IOException {
        byte[] bytes = request.getInputStream().readAllBytes();
        return new String(bytes, StandardCharsets.UTF_8);
    }

    private static String firstHeader(HttpServletRequest request, String... keys) {
        for (String k : keys) {
            String v = request.getHeader(k);
            if (v != null && !v.trim().isEmpty()) {
                return v.trim();
            }
        }
        return null;
    }

    private static String text(JsonNode node, String key) {
        if (node == null || key == null) return null;
        JsonNode v = node.get(key);
        if (v == null || v.isNull()) return null;
        String s = v.asText();
        return s != null ? s.trim() : null;
    }
}

