package com.trustchain.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenValidator {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenValidator.class);

    @Value("${clerk.secret.key:}")
    private String clerkSecretKey;

    /**
     * Validates the JWT token from Clerk
     */
    public boolean validateToken(String token) {
        try {
            if (clerkSecretKey == null || clerkSecretKey.isEmpty()) {
                logger.warn("Clerk secret key not configured. Token validation will fail.");
                return false;
            }

            Claims claims = parseToken(token);

            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                logger.warn("Token has expired");
                return false;
            }

            return true;
        } catch (Exception e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract user ID from token
     */
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getSubject();
        } catch (Exception e) {
            logger.error("Error extracting user ID from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract role from token metadata
     */
    public String getRoleFromToken(String token) {
        try {
            Claims claims = parseToken(token);

            // Clerk stores custom metadata in the token
            // Check for role in public_metadata or custom claims
            Object publicMetadata = claims.get("public_metadata");
            if (publicMetadata instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> metadata = (Map<String, Object>) publicMetadata;
                Object role = metadata.get("role");
                if (role != null) {
                    return role.toString();
                }
            }

            // Fallback to direct role claim
            Object role = claims.get("role");
            if (role != null) {
                return role.toString();
            }

            // Default role if none specified
            return "citizen";
        } catch (Exception e) {
            logger.error("Error extracting role from token: {}", e.getMessage());
            return "citizen";
        }
    }

    /**
     * Parse JWT token and extract claims
     */
    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(clerkSecretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extract email from token
     */
    public String getEmailFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("email", String.class);
        } catch (Exception e) {
            logger.error("Error extracting email from token: {}", e.getMessage());
            return null;
        }
    }
}
