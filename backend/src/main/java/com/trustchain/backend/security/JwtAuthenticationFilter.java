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

import com.trustchain.backend.repository.AuditorRepository;
import com.trustchain.backend.repository.DonorRepository;
import com.trustchain.backend.repository.GovernmentRepository;
import com.trustchain.backend.repository.NgoRepository;
import com.trustchain.backend.repository.VendorRepository;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenValidator jwtTokenValidator;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private GovernmentRepository governmentRepository;

    @Autowired
    private NgoRepository ngoRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private AuditorRepository auditorRepository;

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
                String email = jwtTokenValidator.getEmailFromToken(token);
                String role = resolveRoleFromDatabase(userId, email);

                if (role == null || role.isBlank()) {
                    role = jwtTokenValidator.getRoleFromToken(token);
                }

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

    private String resolveRoleFromDatabase(String userId, String email) {
        if (userId != null && !userId.isBlank()) {
            if (governmentRepository != null && governmentRepository.findByUserId(userId).isPresent())
                return "government";
            if (ngoRepository != null && ngoRepository.findByUserId(userId).isPresent())
                return "ngo";
            if (vendorRepository != null && vendorRepository.findByUserId(userId).isPresent())
                return "vendor";
            if (auditorRepository != null && auditorRepository.findByUserId(userId).isPresent())
                return "auditor";
            if (donorRepository != null && donorRepository.findByUserId(userId).isPresent())
                return "donor";
        }

        if (email != null && !email.isBlank()) {
            if (governmentRepository != null && governmentRepository.findByEmail(email).isPresent())
                return "government";
            if (ngoRepository != null && ngoRepository.findByEmail(email).isPresent())
                return "ngo";
            if (vendorRepository != null && vendorRepository.findByEmail(email).isPresent())
                return "vendor";
            if (auditorRepository != null && auditorRepository.findByEmail(email).isPresent())
                return "auditor";
            if (donorRepository != null && donorRepository.findByEmail(email).isPresent())
                return "donor";
        }

        return null;
    }
}
