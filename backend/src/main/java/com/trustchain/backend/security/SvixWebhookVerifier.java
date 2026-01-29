package com.trustchain.backend.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public final class SvixWebhookVerifier {

    private static final long DEFAULT_TOLERANCE_SECONDS = 300;

    private SvixWebhookVerifier() {
    }

    public static boolean verify(String signingSecret, String msgId, String timestamp, String signatureHeader, String payload) {
        return verify(signingSecret, msgId, timestamp, signatureHeader, payload, DEFAULT_TOLERANCE_SECONDS);
    }

    public static boolean verify(String signingSecret, String msgId, String timestamp, String signatureHeader, String payload, long toleranceSeconds) {
        if (isBlank(signingSecret) || isBlank(msgId) || isBlank(timestamp) || isBlank(signatureHeader) || payload == null) {
            return false;
        }

        if (!verifyTimestamp(timestamp, toleranceSeconds)) {
            return false;
        }

        byte[] secretBytes = decodeSigningSecret(signingSecret);
        if (secretBytes == null || secretBytes.length == 0) {
            return false;
        }

        String signedContent = msgId + "." + timestamp + "." + payload;
        String expected = hmacSha256Base64(secretBytes, signedContent);
        if (expected == null) {
            return false;
        }

        for (String sig : extractV1Signatures(signatureHeader)) {
            if (constantTimeEquals(expected, sig)) {
                return true;
            }
        }

        return false;
    }

    private static boolean verifyTimestamp(String timestamp, long toleranceSeconds) {
        try {
            long ts = Long.parseLong(timestamp);
            long now = Instant.now().getEpochSecond();
            long delta = Math.abs(now - ts);
            return delta <= toleranceSeconds;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private static byte[] decodeSigningSecret(String signingSecret) {
        String s = signingSecret.trim();
        if (s.startsWith("whsec_")) {
            String b64 = s.substring("whsec_".length());
            try {
                return Base64.getDecoder().decode(b64);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        return s.getBytes(StandardCharsets.UTF_8);
    }

    private static String hmacSha256Base64(byte[] secretBytes, String signedContent) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretBytes, "HmacSHA256"));
            byte[] raw = mac.doFinal(signedContent.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(raw);
        } catch (Exception e) {
            return null;
        }
    }

    private static List<String> extractV1Signatures(String signatureHeader) {
        List<String> out = new ArrayList<>();
        for (String part : signatureHeader.trim().split("\\s+")) {
            int comma = part.indexOf(',');
            if (comma <= 0 || comma >= part.length() - 1) {
                continue;
            }
            String version = part.substring(0, comma).trim();
            String sig = part.substring(comma + 1).trim();
            if ("v1".equals(version) && !sig.isEmpty()) {
                out.add(sig);
            }
        }
        return out;
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}

