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
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                // Validate token with Clerk
                if (jwtTokenValidator.validateToken(token)) {
                    String userId = jwtTokenValidator.getUserIdFromToken(token);
                    String email = jwtTokenValidator.getEmailFromToken(token);
                    String role = resolveRoleFromDatabase(userId, email);
                    if (role == null || role.isBlank()) {
                        role = jwtTokenValidator.getRoleFromToken(token);
                    }

                    // Create authentication with role
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.singletonList(authority));

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveRoleFromDatabase(String userId, String email) {
        if (userId != null && !userId.isBlank()) {
            if (governmentRepository.findByUserId(userId).isPresent()) return "government";
            if (ngoRepository.findByUserId(userId).isPresent()) return "ngo";
            if (vendorRepository.findByUserId(userId).isPresent()) return "vendor";
            if (auditorRepository.findByUserId(userId).isPresent()) return "auditor";
            if (donorRepository.findByUserId(userId).isPresent()) return "donor";
        }

        if (email != null && !email.isBlank()) {
            if (governmentRepository.findByEmail(email).isPresent()) return "government";
            if (ngoRepository.findByEmail(email).isPresent()) return "ngo";
            if (vendorRepository.findByEmail(email).isPresent()) return "vendor";
            if (auditorRepository.findByEmail(email).isPresent()) return "auditor";
            if (donorRepository.findByEmail(email).isPresent()) return "donor";
        }

        return null;
    }
}
