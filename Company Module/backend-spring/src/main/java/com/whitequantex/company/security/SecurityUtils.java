package com.whitequantex.company.security;

import com.whitequantex.company.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new UnauthorizedException("Unauthenticated request. A valid corporate identity or session is required.");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }

        try {
            return UUID.fromString(principal.toString());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid authenticated user identity format: " + principal);
        }
    }

    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        String expected = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if (expected.equalsIgnoreCase(ga.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    public static boolean isAdmin() {
        return hasRole("ADMIN") || hasRole("ROLE_ADMIN");
    }
}
