package com.trustchain.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InvoiceUploadSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void uploadInvoiceWithoutTokenHitsControllerUnauthorizedMessage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invoice.pdf",
                "application/pdf",
                "dummy".getBytes()
        );

        mockMvc.perform(
                        multipart("/api/invoice/upload")
                                .file(file)
                                .param("manageId", UUID.randomUUID().toString())
                                .param("amount", "1")
                )
                .andExpect(status().isUnauthorized())
                .andExpect(status().reason("Missing or invalid authorization token"));
    }
}
