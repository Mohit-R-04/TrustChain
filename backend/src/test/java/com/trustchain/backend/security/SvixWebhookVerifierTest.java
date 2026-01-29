package com.trustchain.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SvixWebhookVerifierTest {

    @Test
    void verifiesValidSignature() {
        String secret = "whsec_plJ3nmyCDGBKInavdOK15jsl";
        String payload = "{\"event_type\":\"ping\",\"data\":{\"success\":true}}";
        String msgId = "msg_loFOjxBNrRLzqYUf";
        String timestamp = "1731705121";
        String signature = "v1,rAvfW3dJ/X/qxhsaXPOyyCGmRKsaKWcsNccKXlIktD0=";

        boolean ok = SvixWebhookVerifier.verify(secret, msgId, timestamp, signature, payload, 999999999L);
        assertTrue(ok);
    }

    @Test
    void rejectsInvalidSignature() {
        String secret = "whsec_plJ3nmyCDGBKInavdOK15jsl";
        String payload = "{\"event_type\":\"ping\",\"data\":{\"success\":true}}";
        String msgId = "msg_loFOjxBNrRLzqYUf";
        String timestamp = "1731705121";
        String signature = "v1,invalid";

        boolean ok = SvixWebhookVerifier.verify(secret, msgId, timestamp, signature, payload, 999999999L);
        assertFalse(ok);
    }
}

