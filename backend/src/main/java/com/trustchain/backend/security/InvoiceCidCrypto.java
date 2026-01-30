package com.trustchain.backend.security;

import jakarta.annotation.PostConstruct;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class InvoiceCidCrypto {
    private static final String PREFIX = "tc1:";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;

    private final Environment environment;

    private final SecureRandom secureRandom = new SecureRandom();
    private SecretKey secretKey;

    public InvoiceCidCrypto(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    void init() {
        String secret = environment.getProperty("trustchain.invoice.cid.secret");
        if (secret == null || secret.isBlank()) {
            secret = environment.getProperty("clerk.secret.key");
        }
        if (secret == null || secret.isBlank()) {
            secret = environment.getProperty("CLERK_SECRET_KEY");
        }
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Missing trustchain.invoice.cid.secret");
        }
        this.secretKey = new SecretKeySpec(sha256(secret), "AES");
    }

    public boolean isHashed(String value) {
        return value != null && value.startsWith(PREFIX);
    }

    public String hash(String cid) {
        if (cid == null || cid.isBlank()) {
            return cid;
        }
        if (isHashed(cid)) {
            return cid;
        }
        byte[] iv = new byte[IV_LENGTH_BYTES];
        secureRandom.nextBytes(iv);
        byte[] ciphertext = encrypt(cid.getBytes(StandardCharsets.UTF_8), iv);
        byte[] payload = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, payload, 0, iv.length);
        System.arraycopy(ciphertext, 0, payload, iv.length, ciphertext.length);
        return PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(payload);
    }

    public String unhash(String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return storedValue;
        }
        if (!isHashed(storedValue)) {
            return storedValue;
        }
        String encoded = storedValue.substring(PREFIX.length());
        byte[] payload = Base64.getUrlDecoder().decode(encoded);
        if (payload.length <= IV_LENGTH_BYTES) {
            throw new IllegalArgumentException("Invalid stored invoice CID");
        }
        byte[] iv = new byte[IV_LENGTH_BYTES];
        byte[] ciphertext = new byte[payload.length - IV_LENGTH_BYTES];
        System.arraycopy(payload, 0, iv, 0, IV_LENGTH_BYTES);
        System.arraycopy(payload, IV_LENGTH_BYTES, ciphertext, 0, ciphertext.length);
        byte[] plaintext = decrypt(ciphertext, iv);
        return new String(plaintext, StandardCharsets.UTF_8);
    }

    private byte[] encrypt(byte[] plaintext, byte[] iv) {
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
            return cipher.doFinal(plaintext);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to hash invoice CID", e);
        }
    }

    private byte[] decrypt(byte[] ciphertext, byte[] iv) {
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
            return cipher.doFinal(ciphertext);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to unhash invoice CID", e);
        }
    }

    private static byte[] sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to derive invoice CID key", e);
        }
    }
}
