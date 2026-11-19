package com.whitequantex.company.security;

import com.whitequantex.company.user.UserEntity;
import com.whitequantex.company.user.UserRepository;
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
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtTokenService.validateToken(token)) {
            try {
                UUID userId = jwtTokenService.getUserIdFromToken(token);
                String email = jwtTokenService.getEmailFromToken(token);
                String role = jwtTokenService.getRoleFromToken(token);

                // Verify user is active in the canonical PostgreSQL users table
                Optional<UserEntity> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getIsActive())) {
                    String authority = "ROLE_" + (role != null ? role.toUpperCase() : "CORPORATE");
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(authority))
                    );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    request.setAttribute("authenticatedUserId", userId);
                    request.setAttribute("authenticatedUserEmail", email);
                    request.setAttribute("authenticatedUserRole", role);
                } else {
                    log.debug("User with ID {} not found or inactive in canonical users table", userId);
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception e) {
                log.debug("Failed to set security context from JWT: {}", e.getMessage());
            }
        } else {
            // Check for trusted developer / gateway identity header if present (fallback)
            String devUserId = request.getHeader("X-WQ-User-Id");
            if (devUserId != null && !devUserId.isBlank()) {
                try {
                    UUID uId = UUID.fromString(devUserId.trim());
                    Optional<UserEntity> userOpt = userRepository.findById(uId);
                    if (userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getIsActive())) {
                        UserEntity u = userOpt.get();
                        String role = u.getPrimaryRole() != null ? u.getPrimaryRole().toUpperCase() : "CORPORATE";
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                uId,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        request.setAttribute("authenticatedUserId", uId);
                        request.setAttribute("authenticatedUserEmail", u.getEmail());
                        request.setAttribute("authenticatedUserRole", role);
                    }
                } catch (Exception ignored) {}
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
