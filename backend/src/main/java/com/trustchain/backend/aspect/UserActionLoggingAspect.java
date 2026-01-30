package com.trustchain.backend.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;

@Aspect
@Component
public class UserActionLoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(UserActionLoggingAspect.class);

    // Pointcut for all methods within classes annotated with @RestController or
    // @Controller
    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *) || within(@org.springframework.stereotype.Controller *)")
    public void controllerMethods() {
    }

    @AfterReturning(pointcut = "controllerMethods()", returning = "result")
    public void logAfterAction(JoinPoint joinPoint, Object result) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = "Anonymous";
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                // Try to get a meaningful name
                if (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                    username = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal())
                            .getUsername();
                } else {
                    username = auth.getName();
                }
            }

            // Get Request details
            HttpServletRequest request = null;
            if (RequestContextHolder.getRequestAttributes() != null) {
                request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            }

            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String args = Arrays.toString(joinPoint.getArgs());

            // Mask password/token arguments if any
            if (args.toLowerCase().contains("password") || args.toLowerCase().contains("token")) {
                args = "[PROTECTED]";
            }

            String method = (request != null) ? request.getMethod() : "";
            String uri = (request != null) ? request.getRequestURI() : "";

            // Format: Timestamp [Thread] Level Class - User: [user] performed Action:
            // [METHOD URI] (Class.Method) with Args: [...]
            // The logger pattern in logback.xml handles the timestamp and thread.
            logger.info("User: [{}] performed Action: [{} {}] (Method: {}.{}) with Args: {}",
                    username, method, uri, className, methodName, args);

        } catch (Exception e) {
            logger.error("Error logging user action", e);
        }
    }
}
