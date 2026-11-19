package com.whitequantex.security;

import com.whitequantex.auth.service.UserSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserSessionService userSessionService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtTokenService.validateToken(token)) {
            // Verify session is active in database
            if (userSessionService.isSessionActive(token)) {
                try {
                    UUID userId = jwtTokenService.getUserIdFromToken(token);
                    String email = jwtTokenService.getEmailFromToken(token);
                    String role = jwtTokenService.getRoleFromToken(token);

                    String authority = "ROLE_" + (role != null ? role.toUpperCase() : "INVESTOR");
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(authority))
                    );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // Set verified attributes on request for convenience
                    request.setAttribute("authenticatedUserId", userId);
                    request.setAttribute("authenticatedUserEmail", email);
                    request.setAttribute("authenticatedUserRole", role);
                    request.setAttribute("authenticatedSessionToken", token);

                    // Touch session to record continuous activity
                    userSessionService.touchSession(token);
                } catch (Exception e) {
                    log.debug("Failed to set security context from JWT: {}", e.getMessage());
                }
            } else {
                log.debug("Session for token is inactive, expired, or was deleted on logout");
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Check HttpOnly cookie "wq_auth_token"
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("wq_auth_token".equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
                    return c.getValue();
                }
            }
        }

        // 2. Check Authorization Bearer header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        return null;
    }
}
