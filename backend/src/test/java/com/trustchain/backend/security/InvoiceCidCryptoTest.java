package com.trustchain.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "trustchain.invoice.cid.secret=test-secret")
class InvoiceCidCryptoTest {

    @Autowired
    private InvoiceCidCrypto invoiceCidCrypto;

    @Test
    void hashAndUnhashRoundTrip() {
        String cid = "bafybeigdyrzt4p2f7ek3kct2jw3xk2bq4w2qv2k7gq2xk4b5w6";
        String hashed = invoiceCidCrypto.hash(cid);

        assertNotNull(hashed);
        assertNotEquals(cid, hashed);
        assertTrue(invoiceCidCrypto.isHashed(hashed));
        assertEquals(cid, invoiceCidCrypto.unhash(hashed));
    }

    @Test
    void unhashPlainCidPassesThrough() {
        String cid = "QmYwAPJzv5CZsnAzt8auVZRnGgT6jJzPsv8Yd8F1C3pQyG";
        assertEquals(cid, invoiceCidCrypto.unhash(cid));
    }
}

