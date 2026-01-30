package com.trustchain.backend.service;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.model.Invoice;
import com.trustchain.backend.model.Manage;
import com.trustchain.backend.model.Ngo;
import com.trustchain.backend.model.NgoVendor;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.model.Vendor;
import com.trustchain.backend.repository.InvoicePayoutRepository;
import com.trustchain.backend.repository.NgoVendorRepository;
import com.trustchain.backend.service.blockchain.BlockchainAddressUtil;
import com.trustchain.backend.service.blockchain.DemoEscrowLedgerService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigInteger;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class InvoicePayoutServiceTest {

    @Test
    void payoutToNgoAfterGovernmentAcceptance_usesAllocatedBudgetAndRecordsRelease() {
        BlockchainProperties blockchainProperties = mock(BlockchainProperties.class);
        DemoEscrowLedgerService demoLedger = mock(DemoEscrowLedgerService.class);
        InvoicePayoutRepository payoutRepository = mock(InvoicePayoutRepository.class);
        NgoVendorRepository ngoVendorRepository = mock(NgoVendorRepository.class);

        InvoicePayoutService service = new InvoicePayoutService();
        ReflectionTestUtils.setField(service, "blockchainProperties", blockchainProperties);
        ReflectionTestUtils.setField(service, "demoLedger", demoLedger);
        ReflectionTestUtils.setField(service, "payoutRepository", payoutRepository);
        ReflectionTestUtils.setField(service, "ngoVendorRepository", ngoVendorRepository);

        when(blockchainProperties.isEnabled()).thenReturn(true);
        when(blockchainProperties.isDemoMode()).thenReturn(true);

        UUID schemeUuid = UUID.fromString("22222222-2222-2222-2222-222222222222");
        Scheme scheme = new Scheme();
        scheme.setSchemeId(schemeUuid);

        Ngo ngo = new Ngo();
        ngo.setNgoId(UUID.fromString("33333333-3333-3333-3333-333333333333"));
        ngo.setUserId("ngo_user_1");
        ngo.setWalletAddress("");

        Manage manage = new Manage();
        manage.setManageId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
        manage.setScheme(scheme);
        manage.setNgo(ngo);

        Vendor vendor = new Vendor();
        vendor.setVendorId(UUID.fromString("55555555-5555-5555-5555-555555555555"));
        vendor.setUserId("vendor_user_1");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(UUID.fromString("66666666-6666-6666-6666-666666666666"));
        invoice.setManage(manage);
        invoice.setVendor(vendor);

        NgoVendor order = new NgoVendor();
        order.setAllocatedBudget(200.0);
        when(ngoVendorRepository.findByManage_ManageIdAndVendor_UserId(eq(manage.getManageId()), eq("vendor_user_1")))
                .thenReturn(Optional.of(order));

        String expectedTo = BlockchainAddressUtil.userIdToDemoAddress("ngo_user_1");
        BigInteger expectedWei = new BigInteger("20000000000000");
        when(demoLedger.recordRelease(eq(schemeUuid), any(), eq(expectedTo), eq(expectedWei), eq(invoice.getInvoiceId())))
                .thenReturn("demo-tx");

        when(payoutRepository.findTopByInvoiceIdOrderByCreatedAtDesc(eq(invoice.getInvoiceId()))).thenReturn(Optional.empty());
        when(payoutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var payout = service.payoutToNgoAfterGovernmentAcceptance(invoice);

        assertEquals("SUCCESS", payout.getStatus());
        assertEquals("demo-tx", payout.getTransactionHash());
        assertEquals(expectedWei.toString(), payout.getAmountWei());
        verify(demoLedger, times(1)).recordRelease(eq(schemeUuid), any(), eq(expectedTo), eq(expectedWei), eq(invoice.getInvoiceId()));
        verify(payoutRepository, times(1)).save(any());
    }
}

