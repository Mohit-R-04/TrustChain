package com.trustchain.backend.aspect;

import com.trustchain.backend.annotation.RequireRole;
import com.trustchain.backend.model.UserRole;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Aspect to enforce role-based access control using @RequireRole annotation
 */
@Aspect
@Component
public class RoleCheckAspect {

    @Around("@annotation(com.trustchain.backend.annotation.RequireRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RequireRole requireRole = method.getAnnotation(RequireRole.class);
        UserRole[] requiredRoles = requireRole.value();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        // Get user's roles
        Set<String> userRoles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .collect(Collectors.toSet());

        // Check if user has any of the required roles
        boolean hasRequiredRole = Arrays.stream(requiredRoles)
                .anyMatch(role -> userRoles.contains(role.name()));

        if (!hasRequiredRole) {
            throw new AccessDeniedException(
                    "User does not have required role. Required: " +
                            Arrays.toString(requiredRoles) + ", User has: " + userRoles);
        }

        return joinPoint.proceed();
    }
}
