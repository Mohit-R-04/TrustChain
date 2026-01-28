package com.trustchain.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.DefaultGasProvider;

/**
 * Web3j Configuration for connecting to Polygon Amoy testnet
 */
@Configuration
public class Web3jConfig {
    
    @Value("${blockchain.rpc.url}")
    private String rpcUrl;
    
    @Value("${blockchain.contract.address}")
    private String contractAddress;
    
    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(rpcUrl));
    }
    
    @Bean
    public DefaultGasProvider gasProvider() {
        return new DefaultGasProvider();
    }
    
    public String getContractAddress() {
        return contractAddress;
    }
}
