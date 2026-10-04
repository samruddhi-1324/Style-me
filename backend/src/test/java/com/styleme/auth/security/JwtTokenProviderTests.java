package com.styleme.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTests {

    private JwtTokenProvider tokenProvider;
    private final String secret = "test-secret-key-styleme-testing-purpose-only-256-bits-length!";
    private final long expirationMs = 3600000;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("Generate token creates valid signed JWT with correct claims")
    void testGenerateTokenAndValidate() {
        UUID userId = UUID.randomUUID();
        UserPrincipal userPrincipal = new UserPrincipal(
                userId,
                "customer@example.com",
                "passwordHash",
                true,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        String token = tokenProvider.generateTokenFromUserPrincipal(userPrincipal);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));

        assertEquals("customer@example.com", tokenProvider.getUsernameFromToken(token));
        assertEquals(userId, tokenProvider.getUserIdFromToken(token));
        List<String> roles = tokenProvider.getRolesFromToken(token);
        assertTrue(roles.contains("ROLE_CUSTOMER"));
    }

    @Test
    @DisplayName("validateToken returns false for invalid token")
    void testValidateInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.jwt.token"));
    }

    @Test
    @DisplayName("validateToken returns false for expired token")
    void testValidateExpiredToken() {
        // Provider with negative expiration to simulate expired token
        JwtTokenProvider expiredProvider = new JwtTokenProvider(secret, -1000);
        UserPrincipal userPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "expired@example.com",
                "passwordHash",
                true,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        String expiredToken = expiredProvider.generateTokenFromUserPrincipal(userPrincipal);
        assertFalse(tokenProvider.validateToken(expiredToken));
    }
}
