package com.trustchain.backend.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

public class JwtAuthenticationFilterTest {

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void setsAuthenticationForValidBearerToken() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter();
        setField(filter, "jwtTokenValidator", new JwtTokenValidator() {
            @Override
            public boolean validateToken(String token) {
                return true;
            }

            @Override
            public String getUserIdFromToken(String token) {
                return "user_123";
            }

            @Override
            public String getRoleFromToken(String token) {
                return "vendor";
            }
        });

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/invoice/upload");
        request.addHeader("Authorization", "Bearer test.token.value");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("user_123", SecurityContextHolder.getContext().getAuthentication().getName());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_VENDOR")));
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}

