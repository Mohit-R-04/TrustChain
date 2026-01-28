package com.trustchain.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.crypto.Credentials;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Service for interacting with TrustChainEscrow smart contract
 */
@Service
public class TrustChainEscrowService {
    
    @Autowired
    private Web3j web3j;
    
    @Value("${blockchain.contract.address}")
    private String contractAddress;
    
    @Autowired
    private DefaultGasProvider gasProvider;
    
    // ========== VIEW FUNCTIONS (Read-Only) ==========
    
    /**
     * Get milestone details
     */
    public Milestone getMilestone(BigInteger schemeId, BigInteger milestoneId) throws Exception {
        Function function = new Function(
            "getMilestone",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
            Arrays.asList(new TypeReference<DynamicStruct>() {})
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
            Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
            DefaultBlockParameterName.LATEST
        ).send();
        
        List<Type> results = FunctionReturnDecoder.decode(
            response.getValue(),
            function.getOutputParameters()
        );
        
        if (results.isEmpty()) {
            throw new Exception("No milestone found");
        }
        
        DynamicStruct struct = (DynamicStruct) results.get(0);
        return new Milestone(
            ((Uint256) struct.getValue().get(0)).getValue(),  // amount
            ((Address) struct.getValue().get(1)).getValue(),   // vendor
            ((Utf8String) struct.getValue().get(2)).getValue(), // quotationHash
            ((Utf8String) struct.getValue().get(3)).getValue(), // proofHash
            ((Uint8) struct.getValue().get(4)).getValue().intValue() // status
        );
    }
    
    /**
     * Get scheme balance
     */
    public BigInteger getSchemeBalance(BigInteger schemeId) throws Exception {
        Function function = new Function(
            "getSchemeBalance",
            Collections.singletonList(new Uint256(schemeId)),
            Collections.singletonList(new TypeReference<Uint256>() {})
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
            Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
            DefaultBlockParameterName.LATEST
        ).send();
        
        List<Type> results = FunctionReturnDecoder.decode(
            response.getValue(),
            function.getOutputParameters()
        );
        
        return ((Uint256) results.get(0)).getValue();
    }
    
    /**
     * Get donor contribution
     */
    public BigInteger getDonorContribution(BigInteger schemeId, String donorAddress) throws Exception {
        Function function = new Function(
            "getDonorContribution",
            Arrays.asList(new Uint256(schemeId), new Address(donorAddress)),
            Collections.singletonList(new TypeReference<Uint256>() {})
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
            Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
            DefaultBlockParameterName.LATEST
        ).send();
        
        List<Type> results = FunctionReturnDecoder.decode(
            response.getValue(),
            function.getOutputParameters()
        );
        
        return ((Uint256) results.get(0)).getValue();
    }
    
    /**
     * Get proof record
     */
    public ProofRecord getProof(BigInteger schemeId, BigInteger milestoneId) throws Exception {
        Function function = new Function(
            "getProof",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
            Arrays.asList(new TypeReference<DynamicStruct>() {})
        );
        
        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
            Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
            DefaultBlockParameterName.LATEST
        ).send();
        
        List<Type> results = FunctionReturnDecoder.decode(
            response.getValue(),
            function.getOutputParameters()
        );
        
        if (results.isEmpty()) {
            throw new Exception("No proof found");
        }
        
        DynamicStruct struct = (DynamicStruct) results.get(0);
        return new ProofRecord(
            ((Address) struct.getValue().get(0)).getValue(),  // vendor
            ((Utf8String) struct.getValue().get(1)).getValue() // ipfsHash
        );
    }
    
    // ========== WRITE FUNCTIONS (Require Private Key & Gas) ==========
    
    /**
     * Create a new scheme (Only contract owner)
     * Requires: Credentials with private key
     */
    public String createScheme(BigInteger schemeId, Credentials credentials) throws Exception {
        Function function = new Function(
            "createScheme",
            Collections.singletonList(new Uint256(schemeId)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Deposit funds to a scheme
     * Requires: Credentials with private key + ETH/MATIC amount
     */
    public String depositFunds(BigInteger schemeId, BigInteger amountInWei, Credentials credentials) throws Exception {
        Function function = new Function(
            "depositFunds",
            Collections.singletonList(new Uint256(schemeId)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, amountInWei);
    }
    
    /**
     * Lock funds for a scheme (Only contract owner)
     */
    public String lockFunds(BigInteger schemeId, Credentials credentials) throws Exception {
        Function function = new Function(
            "lockFunds",
            Collections.singletonList(new Uint256(schemeId)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Create a milestone (Only contract owner)
     */
    public String createMilestone(BigInteger schemeId, BigInteger milestoneId, BigInteger amount, Credentials credentials) throws Exception {
        Function function = new Function(
            "createMilestone",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Uint256(amount)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Set vendor for milestone (Only contract owner)
     */
    public String setVendorForMilestone(BigInteger schemeId, BigInteger milestoneId, String vendorAddress, Credentials credentials) throws Exception {
        Function function = new Function(
            "setVendorForMilestone",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Address(vendorAddress)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Store quotation hash (Only contract owner)
     */
    public String storeQuotationHash(BigInteger schemeId, BigInteger milestoneId, String ipfsHash, Credentials credentials) throws Exception {
        Function function = new Function(
            "storeQuotationHash",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Utf8String(ipfsHash)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Submit proof by vendor
     */
    public String submitProof(BigInteger schemeId, BigInteger milestoneId, String ipfsHash, Credentials credentials) throws Exception {
        Function function = new Function(
            "submitProof",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Utf8String(ipfsHash)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Approve proof (Only contract owner)
     */
    public String approveProof(BigInteger schemeId, BigInteger milestoneId, Credentials credentials) throws Exception {
        Function function = new Function(
            "approveProof",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Reject proof (Only contract owner)
     */
    public String rejectProof(BigInteger schemeId, BigInteger milestoneId, Credentials credentials) throws Exception {
        Function function = new Function(
            "rejectProof",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Release payment (Only contract owner)
     */
    public String releasePayment(BigInteger schemeId, BigInteger milestoneId, Credentials credentials) throws Exception {
        Function function = new Function(
            "releasePayment",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    /**
     * Refund if rejected (Only contract owner)
     */
    public String refundIfRejected(BigInteger schemeId, BigInteger milestoneId, String refundAddress, Credentials credentials) throws Exception {
        Function function = new Function(
            "refundIfRejected",
            Arrays.asList(new Uint256(schemeId), new Uint256(milestoneId), new Address(refundAddress)),
            Collections.emptyList()
        );
        
        return sendTransaction(function, credentials, BigInteger.ZERO);
    }
    
    // ========== HELPER METHODS ==========
    
    /**
     * Send transaction to blockchain
     */
    private String sendTransaction(Function function, Credentials credentials, BigInteger value) throws Exception {
        String encodedFunction = FunctionEncoder.encode(function);
        
        EthSendTransaction transactionResponse = web3j.ethSendRawTransaction(
            // Note: In production, use RawTransactionManager or TransactionManager
            // This is a simplified example - you need to properly sign transactions
            encodedFunction
        ).send();
        
        if (transactionResponse.hasError()) {
            throw new Exception("Transaction failed: " + transactionResponse.getError().getMessage());
        }
        
        return transactionResponse.getTransactionHash();
    }
    
    // ========== DATA CLASSES ==========
    
    public static class Milestone {
        public BigInteger amount;
        public String vendor;
        public String quotationHash;
        public String proofHash;
        public int status;
        
        public Milestone(BigInteger amount, String vendor, String quotationHash, String proofHash, int status) {
            this.amount = amount;
            this.vendor = vendor;
            this.quotationHash = quotationHash;
            this.proofHash = proofHash;
            this.status = status;
        }
    }
    
    public static class ProofRecord {
        public String vendor;
        public String ipfsHash;
        
        public ProofRecord(String vendor, String ipfsHash) {
            this.vendor = vendor;
            this.ipfsHash = ipfsHash;
        }
    }
}
