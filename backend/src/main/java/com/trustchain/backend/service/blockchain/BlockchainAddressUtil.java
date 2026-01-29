package com.trustchain.backend.service.blockchain;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class BlockchainAddressUtil {
    private BlockchainAddressUtil() {
    }

    public static String userIdToDemoAddress(String userId) {
        if (userId == null || userId.isBlank()) {
            return "0x0000000000000000000000000000000000000000";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(userId.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(42);
            sb.append("0x");
            for (int i = 0; i < 20; i++) {
                sb.append(String.format("%02x", hash[i]));
            }
            return sb.toString();
        } catch (Exception e) {
            return "0x0000000000000000000000000000000000000000";
        }
    }
}
