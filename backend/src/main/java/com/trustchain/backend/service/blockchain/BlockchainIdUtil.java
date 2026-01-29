package com.trustchain.backend.service.blockchain;

import java.math.BigInteger;
import java.util.UUID;

public final class BlockchainIdUtil {
    private BlockchainIdUtil() {
    }

    public static BigInteger uuidToUint256(UUID uuid) {
        String hex = uuid.toString().replace("-", "");
        return new BigInteger(hex, 16);
    }
}
