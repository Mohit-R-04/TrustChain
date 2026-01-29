package com.trustchain.backend.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;

@Configuration
@EnableConfigurationProperties(BlockchainProperties.class)
public class BlockchainConfig {

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
