package com.styleme.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.security.csrf-enabled=true")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CsrfProtectionTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void unsafeRequestWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isForbidden());
    }

    @Test
    void csrfTokenCookieAndHeaderAllowUnsafeRequest() throws Exception {
        MvcResult tokenResult = mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        String token = objectMapper.readTree(tokenResult.getResponse().getContentAsString())
                .path("data")
                .path("token")
                .asText();
        Cookie csrfCookie = tokenResult.getResponse().getCookie("XSRF-TOKEN");
        assertNotNull(csrfCookie);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", token))
                .andExpect(status().isOk());
    }

    @Test
    void corsPreflightAllowsCsrfHeader() throws Exception {
        mockMvc.perform(options("/api/v1/auth/logout")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Headers",
                        org.hamcrest.Matchers.containsString("x-xsrf-token")));
    }
}
