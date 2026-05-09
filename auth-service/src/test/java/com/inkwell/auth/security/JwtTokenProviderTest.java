package com.inkwell.auth.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "testSecretKeyWithEnoughLengthForHS256Algorithm");
        ReflectionTestUtils.setField(jwtTokenProvider, "accessTokenExpiry", 3600000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenExpiry", 86400000L);
    }

    @Test
    void generateAccessToken_ShouldReturnValidToken() {
        String userId = "1";
        String email = "test@example.com";
        String role = "READER";

        String token = jwtTokenProvider.generateAccessToken(userId, email, role);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.isTokenValid(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
        
        Claims claims = jwtTokenProvider.validateToken(token);
        assertEquals(email, claims.get("email"));
        assertEquals(role, claims.get("role"));
    }

    @Test
    void generateRefreshToken_ShouldReturnValidToken() {
        String userId = "1";

        String token = jwtTokenProvider.generateRefreshToken(userId);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.isTokenValid(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenTokenIsInvalid() {
        String invalidToken = "invalid.token.here";
        assertFalse(jwtTokenProvider.isTokenValid(invalidToken));
    }
}
