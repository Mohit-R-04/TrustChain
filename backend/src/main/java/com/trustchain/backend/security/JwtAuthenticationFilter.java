package com.trustchain.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenValidator jwtTokenValidator;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String uri = request.getRequestURI();
            boolean isInvoiceUpload = uri != null && uri.startsWith("/api/invoice/upload");
            String authHeader = request.getHeader("Authorization");
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }

            boolean tokenValid = token != null && !token.isBlank() && jwtTokenValidator.validateToken(token);
            String tokenParam = null;

            if (!tokenValid && isInvoiceUpload) {
                tokenParam = request.getParameter("authToken");
                if (tokenParam != null && !tokenParam.isBlank()) {
                    token = tokenParam.trim();
                }
                tokenValid = token != null && !token.isBlank() && jwtTokenValidator.validateToken(token);
            }

            if (isInvoiceUpload) {
                logger.info("Invoice upload auth: uri=" + uri
                        + ", hasAuthHeader=" + (authHeader != null && !authHeader.isBlank())
                        + ", hasAuthTokenParam=" + (tokenParam != null && !tokenParam.isBlank())
                        + ", tokenValid=" + tokenValid
                        + ", tokenLen=" + (token == null ? 0 : token.length())
                        + ", tokenDots=" + (token == null ? 0 : token.chars().filter(c -> c == '.').count()));
            }

            if (tokenValid) {
                String userId = jwtTokenValidator.getUserIdFromToken(token);
                String role = jwtTokenValidator.getRoleFromToken(token);

                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        Collections.singletonList(authority));

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }
}
