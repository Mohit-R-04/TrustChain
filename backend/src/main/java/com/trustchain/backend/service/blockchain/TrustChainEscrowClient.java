package com.trustchain.backend.service.blockchain;

import com.trustchain.backend.config.BlockchainProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.TransactionReceiptProcessor;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@ConditionalOnExpression("'${blockchain.enabled:false}'=='true' && T(org.springframework.util.StringUtils).hasText('${blockchain.private-key:}')")
public class TrustChainEscrowClient {

    @Autowired
    private Web3j web3j;

    @Autowired
    private TransactionManager transactionManager;

    @Autowired
    private TransactionReceiptProcessor receiptProcessor;

    @Autowired
    private BlockchainProperties properties;

    @Autowired
    private Credentials credentials;

    public String fromAddress() {
        return credentials.getAddress();
    }

    public boolean schemeExists(BigInteger schemeId) throws Exception {
        Function function = new Function(
                "schemeExists",
                Collections.singletonList(new Uint256(schemeId)),
                Collections.singletonList(new TypeReference<Bool>() {})
        );
        List<Type> out = call(function);
        return ((Bool) out.get(0)).getValue();
    }

    public TransactionReceipt createScheme(BigInteger schemeId) throws Exception {
        Function function = new Function(
                "createScheme",
                Collections.singletonList(new Uint256(schemeId)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt depositFunds(BigInteger schemeId, BigInteger amountWei) throws Exception {
        Function function = new Function(
                "depositFunds",
                Collections.singletonList(new Uint256(schemeId)),
                Collections.emptyList()
        );
        return send(function, amountWei);
    }

    public TransactionReceipt lockFunds(BigInteger schemeId) throws Exception {
        Function function = new Function(
                "lockFunds",
                Collections.singletonList(new Uint256(schemeId)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt createMilestone(BigInteger schemeId, BigInteger milestoneId, BigInteger amountWei) throws Exception {
        Function function = new Function(
                "createMilestone",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Uint256(amountWei)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt setVendorForMilestone(BigInteger schemeId, BigInteger milestoneId, String vendorWallet) throws Exception {
        Function function = new Function(
                "setVendorForMilestone",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Address(vendorWallet)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt storeQuotationHash(BigInteger schemeId, BigInteger milestoneId, String ipfsHash) throws Exception {
        Function function = new Function(
                "storeQuotationHash",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Utf8String(ipfsHash)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt submitProof(BigInteger schemeId, BigInteger milestoneId, String ipfsHash) throws Exception {
        Function function = new Function(
                "submitProof",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Utf8String(ipfsHash)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt storeInvoiceHash(byte[] invoiceIdBytes32, String ipfsHash) throws Exception {
        Function function = new Function(
                "storeInvoiceHash",
                Arrays.asList(new Bytes32(invoiceIdBytes32), new Utf8String(ipfsHash)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public String getInvoiceHash(byte[] invoiceIdBytes32) throws Exception {
        Function function = new Function(
                "getInvoiceHash",
                Collections.singletonList(new Bytes32(invoiceIdBytes32)),
                Collections.singletonList(new TypeReference<Utf8String>() {})
        );
        List<Type> out = call(function);
        return ((Utf8String) out.get(0)).getValue();
    }

    public TransactionReceipt approveProof(BigInteger schemeId, BigInteger milestoneId) throws Exception {
        Function function = new Function(
                "approveProof",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt rejectProof(BigInteger schemeId, BigInteger milestoneId) throws Exception {
        Function function = new Function(
                "rejectProof",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt releasePayment(BigInteger schemeId, BigInteger milestoneId) throws Exception {
        Function function = new Function(
                "releasePayment",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    public TransactionReceipt refundIfRejected(BigInteger schemeId, BigInteger milestoneId, String toAddress) throws Exception {
        Function function = new Function(
                "refundIfRejected",
                Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Address(toAddress)),
                Collections.emptyList()
        );
        return send(function, BigInteger.ZERO);
    }

    private TransactionReceipt send(Function function, BigInteger valueWei) throws Exception {
        BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
        String data = FunctionEncoder.encode(function);
        EthSendTransaction sent = transactionManager.sendTransaction(gasPrice, BigInteger.valueOf(properties.getGasLimit()),
                properties.getContractAddress(), data, valueWei);
        if (sent.hasError()) {
            throw new IllegalStateException(sent.getError().getMessage());
        }
        return receiptProcessor.waitForTransactionReceipt(sent.getTransactionHash());
    }

    private List<Type> call(Function function) throws Exception {
        String encoded = FunctionEncoder.encode(function);
        Transaction tx = Transaction.createEthCallTransaction(fromAddress(), properties.getContractAddress(), encoded);
        EthCall response = web3j.ethCall(tx, DefaultBlockParameterName.LATEST).send();
        return FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
    }
}
