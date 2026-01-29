package com.trustchain.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@EnableConfigurationProperties(BlockchainProperties.class)
public class BlockchainConfig {

    @Bean
    public ApplicationRunner blockchainDeploymentLoader(BlockchainProperties properties) {
        return args -> {
            String current = properties.getContractAddress();
            if (current != null && !current.isBlank() && !"0xd9145CCE52D386f254917e481eB44e9943F39138".equalsIgnoreCase(current)) {
                return;
            }

            Path[] candidates = new Path[] {
                    Paths.get("../blockchain/deployments/latest.json"),
                    Paths.get("blockchain/deployments/latest.json")
            };

            for (Path p : candidates) {
                if (!Files.exists(p)) continue;
                try {
                    String json = Files.readString(p);
                    JsonNode root = new ObjectMapper().readTree(json);
                    String contract = root.hasNonNull("contractAddress") ? root.get("contractAddress").asText() : null;
                    if (contract != null && !contract.isBlank()) {
                        properties.setContractAddress(contract);
                    }
                    if ((properties.getRpcUrl() == null || properties.getRpcUrl().isBlank()) && root.hasNonNull("rpcUrl")) {
                        properties.setRpcUrl(root.get("rpcUrl").asText());
                    }
                    if (properties.getChainId() <= 0 && root.hasNonNull("chainId")) {
                        properties.setChainId(root.get("chainId").asLong());
                    }
                    return;
                } catch (Exception ignored) {
                    return;
                }
            }
        };
    }

    @Bean
    @ConditionalOnProperty(prefix = "blockchain", name = "enabled", havingValue = "true")
    public Web3j web3j(BlockchainProperties properties) {
        return Web3j.build(new HttpService(properties.getRpcUrl()));
    }

    @Bean
    @ConditionalOnExpression("'${blockchain.enabled:false}'=='true' && T(org.springframework.util.StringUtils).hasText('${blockchain.private-key:}')")
    public Credentials blockchainCredentials(BlockchainProperties properties) {
        return Credentials.create(properties.getPrivateKey());
    }

    @Bean
    @ConditionalOnProperty(prefix = "blockchain", name = "enabled", havingValue = "true")
    public TransactionReceiptProcessor transactionReceiptProcessor(Web3j web3j) {
        return new PollingTransactionReceiptProcessor(web3j, 2000, 30);
    }

    @Bean
    @ConditionalOnExpression("'${blockchain.enabled:false}'=='true' && T(org.springframework.util.StringUtils).hasText('${blockchain.private-key:}')")
    public TransactionManager web3jTransactionManager(Web3j web3j, BlockchainProperties properties, Credentials credentials,
                                                      TransactionReceiptProcessor receiptProcessor) {
        return new RawTransactionManager(web3j, credentials, properties.getChainId(), receiptProcessor);
    }
}
