package com.trustchain.backend.service;

import com.trustchain.backend.config.BlockchainProperties;
import com.trustchain.backend.dto.DonationRequest;
import com.trustchain.backend.model.Donor;
import com.trustchain.backend.model.Donation;
import com.trustchain.backend.model.Scheme;
import com.trustchain.backend.repository.DonationRepository;
import com.trustchain.backend.repository.DonorRepository;
import com.trustchain.backend.repository.SchemeRepository;
import com.trustchain.backend.service.blockchain.DemoEscrowLedgerService;
import com.trustchain.backend.service.blockchain.BlockchainAddressUtil;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigInteger;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class DonationServiceTest {

    @Test
    void processDonation_recordsDemoDepositWhenEnabled() {
        DonationRepository donationRepository = mock(DonationRepository.class);
        SchemeRepository schemeRepository = mock(SchemeRepository.class);
        DonorRepository donorRepository = mock(DonorRepository.class);
        PaymentService paymentService = mock(PaymentService.class);
        BlockchainProperties blockchainProperties = mock(BlockchainProperties.class);
        DemoEscrowLedgerService demoLedger = mock(DemoEscrowLedgerService.class);

        DonationService service = new DonationService();
        ReflectionTestUtils.setField(service, "donationRepository", donationRepository);
        ReflectionTestUtils.setField(service, "schemeRepository", schemeRepository);
        ReflectionTestUtils.setField(service, "donorRepository", donorRepository);
        ReflectionTestUtils.setField(service, "paymentService", paymentService);
        ReflectionTestUtils.setField(service, "blockchainProperties", blockchainProperties);
        ReflectionTestUtils.setField(service, "demoLedger", demoLedger);

        UUID schemeUuid = UUID.fromString("11111111-1111-1111-1111-111111111111");
        Scheme scheme = new Scheme();
        scheme.setSchemeId(schemeUuid);
        scheme.setSchemeName("Education for All");
        when(schemeRepository.findById(eq(schemeUuid))).thenReturn(Optional.of(scheme));

        Donor donor = new Donor();
        donor.setUserId("user_123");
        donor.setName("Donor user_1");
        when(donorRepository.findByUserId(eq("user_123"))).thenReturn(Optional.of(donor));

        when(paymentService.processPayment(any(), any(), any())).thenReturn(true);
        when(paymentService.generateTransactionReference()).thenReturn("tx_ref");
        when(donationRepository.save(any(Donation.class))).thenAnswer(inv -> inv.getArgument(0));

        when(blockchainProperties.isEnabled()).thenReturn(true);
        when(blockchainProperties.isDemoMode()).thenReturn(true);

        DonationRequest request = new DonationRequest();
        request.setSchemeId(schemeUuid);
        request.setSchemeName("Education for All");
        request.setAmount(100000.0);
        request.setPaymentToken("tok_visa");

        service.processDonation(request, "user_123");

        BigInteger expectedWei = new BigInteger("10000000000000000");
        verify(demoLedger, times(1)).recordDeposit(eq(schemeUuid), any(BigInteger.class), eq(BlockchainAddressUtil.userIdToDemoAddress("user_123")), eq(expectedWei));

        verify(donationRepository, times(1)).save(any(Donation.class));
        verify(paymentService, times(1)).processPayment(eq(100000.0), eq("INR"), eq("tok_visa"));
    }
}
