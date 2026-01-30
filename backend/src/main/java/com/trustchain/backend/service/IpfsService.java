package com.trustchain.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.client.MultipartBodyBuilder;

import java.io.IOException;

@Service
public class IpfsService {
    private final WebClient web3StorageClient;
    private final WebClient kuboClient;
    private final WebClient pinataClient;
    private final ObjectMapper objectMapper;
    private final String token;
    private final String pinataJwt;
    private final String provider;

    public IpfsService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${ipfs.web3storage.token:}") String token,
            @Value("${ipfs.pinata.jwt:}") String pinataJwt,
            @Value("${ipfs.provider:web3storage}") String provider,
            @Value("${ipfs.kubo.api-base-url:http://localhost:5001}") String kuboApiBaseUrl,
            @Value("${ipfs.pinata.api-base-url:https://api.pinata.cloud}") String pinataApiBaseUrl
    ) {
        this.web3StorageClient = webClientBuilder
                .baseUrl("https://api.web3.storage")
                .build();
        this.kuboClient = webClientBuilder
                .baseUrl(kuboApiBaseUrl)
                .build();
        this.pinataClient = webClientBuilder
                .baseUrl(pinataApiBaseUrl)
                .build();
        this.objectMapper = objectMapper;
        this.token = token;
        this.pinataJwt = pinataJwt;
        this.provider = provider == null ? "web3storage" : provider.trim().toLowerCase();
    }

    public String uploadInvoice(byte[] bytes, String filename, String contentType) {
        if (bytes == null || bytes.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice file is required");
        }

        String safeFilename = filename != null && !filename.isBlank() ? filename : "invoice";
        String safeContentType = contentType != null && !contentType.isBlank() ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return uploadBytes(bytes, safeFilename, safeContentType);
    }

    public String uploadJson(Object payload, String filename) {
        if (payload == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payload is required");
        }
        String safeFilename = filename != null && !filename.isBlank() ? filename : "payload.json";
        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(payload);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to serialize JSON payload");
        }
        return uploadBytes(bytes, safeFilename, MediaType.APPLICATION_JSON_VALUE);
    }

    public String uploadBytes(byte[] bytes, String filename, String contentType) {
        if (bytes == null || bytes.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File bytes are required");
        }

        String safeFilename = filename != null && !filename.isBlank() ? filename : "file";
        String safeContentType = contentType != null && !contentType.isBlank() ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        ByteArrayResource resource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return safeFilename;
            }
        };

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", resource)
                .contentType(MediaType.parseMediaType(safeContentType));

        MultiValueMap<String, HttpEntity<?>> multipart = builder.build();

        if (provider.equals("kubo") || provider.equals("local")) {
            return uploadViaKubo(multipart);
        }
        if (provider.equals("pinata")) {
            return uploadViaPinata(multipart);
        }
        if (!provider.equals("web3storage") && !provider.equals("w3s")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported IPFS provider: " + provider);
        }
        if (token == null || token.isBlank()) {
            if (pinataJwt != null && !pinataJwt.isBlank()) {
                return uploadViaPinata(multipart);
            }
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "IPFS upload not configured (set ipfs.web3storage.token / env IPFS_WEB3STORAGE_TOKEN or WEB3_STORAGE_TOKEN, or set ipfs.provider=kubo/pinata)"
            );
        }

        String responseBody = web3StorageClient.post()
                .uri("/upload")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipart))
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class).map(body ->
                                new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed: " + body)))
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (empty response)");
        }

        try {
            JsonNode node = objectMapper.readTree(responseBody);
            JsonNode cidNode = node.get("cid");
            if (cidNode == null || cidNode.asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (missing cid)");
            }
            return cidNode.asText();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (invalid response)");
        }
    }

    private String uploadViaKubo(MultiValueMap<String, HttpEntity<?>> multipart) {
        String responseBody = kuboClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v0/add")
                        .queryParam("pin", "true")
                        .build())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipart))
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class).map(body ->
                                new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed: " + body)))
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (empty response)");
        }

        String lastJsonLine = responseBody.trim();
        int lastNewline = lastJsonLine.lastIndexOf('\n');
        if (lastNewline >= 0) {
            lastJsonLine = lastJsonLine.substring(lastNewline + 1).trim();
        }

        try {
            JsonNode node = objectMapper.readTree(lastJsonLine);
            JsonNode cidNode = node.get("Hash");
            if (cidNode == null || cidNode.asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (missing Hash)");
            }
            return cidNode.asText();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (invalid response)");
        }
    }

    private String uploadViaPinata(MultiValueMap<String, HttpEntity<?>> multipart) {
        if (pinataJwt == null || pinataJwt.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "IPFS upload not configured (set ipfs.pinata.jwt / env PINATA_JWT, or set ipfs.provider=kubo)"
            );
        }

        String responseBody = pinataClient.post()
                .uri("/pinning/pinFileToIPFS")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + pinataJwt)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipart))
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class).map(body ->
                                new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed: " + body)))
                .bodyToMono(String.class)
                .block();

        if (responseBody == null || responseBody.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (empty response)");
        }

        try {
            JsonNode node = objectMapper.readTree(responseBody);
            JsonNode cidNode = node.get("IpfsHash");
            if (cidNode == null || cidNode.asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (missing IpfsHash)");
            }
            return cidNode.asText();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "IPFS upload failed (invalid response)");
        }
    }
}
