package com.whitequantex.auth.service;

import com.whitequantex.auth.dto.UserActivityDto;
import com.whitequantex.auth.dto.UserSessionDto;
import com.whitequantex.auth.entity.UserSessionActivityEntity;
import com.whitequantex.auth.entity.UserSessionEntity;
import com.whitequantex.auth.repository.UserSessionActivityRepository;
import com.whitequantex.auth.repository.UserSessionRepository;
import com.whitequantex.users.entity.UserEntity;
import com.whitequantex.users.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;
    private final UserSessionActivityRepository userSessionActivityRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserSessionEntity createSession(UserEntity user, String token, HttpServletRequest request) {
        String ipAddress = extractClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";
        String deviceType = detectDeviceType(userAgent);
        String browser = detectBrowser(userAgent);
        String os = detectOperatingSystem(userAgent);
        String location = resolveLocation(ipAddress);

        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofDays(7));

        UserSessionEntity session = UserSessionEntity.builder()
                .user(user)
                .sessionToken(token)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .deviceType(deviceType)
                .browser(browser)
                .operatingSystem(os)
                .location(location)
                .isActive(true)
                .loginAt(now)
                .lastActivityAt(now)
                .expiresAt(expiresAt)
                .build();

        session = userSessionRepository.save(session);

        // Record initial LOGIN activity
        UserSessionActivityEntity activity = UserSessionActivityEntity.builder()
                .session(session)
                .user(user)
                .activityType("LOGIN")
                .activityName("User Authenticated Session")
                .path(request != null ? request.getRequestURI() : "/api/auth/login")
                .metadata(String.format("Logged in on %s (%s) from %s", browser, os, ipAddress))
                .ipAddress(ipAddress)
                .createdAt(now)
                .build();

        userSessionActivityRepository.save(activity);
        log.info("Created session {} for user {}", session.getId(), user.getEmail());

        return session;
    }

    @Transactional(readOnly = true)
    public boolean isSessionActive(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Optional<UserSessionEntity> sessionOpt = userSessionRepository.findBySessionTokenAndIsActiveTrue(token);
        if (sessionOpt.isEmpty()) {
            return false;
        }
        UserSessionEntity session = sessionOpt.get();
        if (session.getExpiresAt().isBefore(Instant.now())) {
            return false;
        }
        return Boolean.TRUE.equals(session.getIsActive());
    }

    @Transactional
    public void touchSession(String token) {
        if (token == null || token.isBlank()) return;
        userSessionRepository.findBySessionTokenAndIsActiveTrue(token).ifPresent(session -> {
            session.setLastActivityAt(Instant.now());
            userSessionRepository.save(session);
        });
    }

    @Transactional
    public void recordActivity(
            UUID userId,
            String token,
            String activityType,
            String activityName,
            String path,
            String metadata,
            HttpServletRequest request
    ) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        UserSessionEntity session = null;
        if (token != null && !token.isBlank()) {
            session = userSessionRepository.findBySessionToken(token).orElse(null);
            if (session != null && Boolean.TRUE.equals(session.getIsActive())) {
                session.setLastActivityAt(Instant.now());
                userSessionRepository.save(session);
            }
        }

        String ipAddress = extractClientIp(request);
        UserSessionActivityEntity activity = UserSessionActivityEntity.builder()
                .session(session)
                .user(user)
                .activityType(activityType != null ? activityType.toUpperCase() : "INTERACTION")
                .activityName(activityName != null ? activityName : "User Activity")
                .path(path)
                .metadata(metadata)
                .ipAddress(ipAddress)
                .createdAt(Instant.now())
                .build();

        userSessionActivityRepository.save(activity);
    }

    @Transactional
    public void terminateSession(String token, HttpServletRequest request) {
        if (token == null || token.isBlank()) return;

        Optional<UserSessionEntity> sessionOpt = userSessionRepository.findBySessionToken(token);
        if (sessionOpt.isPresent()) {
            UserSessionEntity session = sessionOpt.get();
            String ipAddress = extractClientIp(request);

            // Record LOGOUT audit activity before session deletion
            UserSessionActivityEntity activity = UserSessionActivityEntity.builder()
                    .session(null) // Unlinked since session is being deleted
                    .user(session.getUser())
                    .activityType("LOGOUT")
                    .activityName("User Logged Out")
                    .path(request != null ? request.getRequestURI() : "/api/auth/logout")
                    .metadata("Session terminated and deleted from server")
                    .ipAddress(ipAddress)
                    .createdAt(Instant.now())
                    .build();
            userSessionActivityRepository.save(activity);

            // Delete user's active session
            userSessionRepository.delete(session);
            log.info("Deleted session {} for user {}", session.getId(), session.getUser().getEmail());
        }
    }

    @Transactional
    public boolean deleteSessionById(UUID sessionId, UUID userId) {
        Optional<UserSessionEntity> sessionOpt = userSessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSessionEntity session = sessionOpt.get();
            if (session.getUser().getId().equals(userId)) {
                UserSessionActivityEntity activity = UserSessionActivityEntity.builder()
                        .session(null)
                        .user(session.getUser())
                        .activityType("LOGOUT")
                        .activityName("Session Revoked")
                        .path("/api/auth/sessions/" + sessionId)
                        .metadata("Session revoked by user request")
                        .ipAddress(session.getIpAddress())
                        .createdAt(Instant.now())
                        .build();
                userSessionActivityRepository.save(activity);

                userSessionRepository.delete(session);
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public Optional<UserSessionDto> getCurrentSession(String token) {
        if (token == null || token.isBlank()) return Optional.empty();
        return userSessionRepository.findBySessionToken(token)
                .map(s -> toDto(s, true));
    }

    @Transactional(readOnly = true)
    public List<UserSessionDto> getActiveSessions(UUID userId, String currentToken) {
        List<UserSessionEntity> sessions = userSessionRepository.findByUserIdAndIsActiveTrueOrderByLastActivityAtDesc(userId);
        return sessions.stream()
                .map(s -> toDto(s, s.getSessionToken().equals(currentToken)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserActivityDto> getUserActivities(UUID userId, int limit) {
        int max = Math.min(Math.max(limit, 1), 100);
        List<UserSessionActivityEntity> activities = userSessionActivityRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, max));

        return activities.stream().map(a -> UserActivityDto.builder()
                .id(a.getId())
                .sessionId(a.getSession() != null ? a.getSession().getId() : null)
                .userId(a.getUser().getId())
                .activityType(a.getActivityType())
                .activityName(a.getActivityName())
                .path(a.getPath())
                .metadata(a.getMetadata())
                .ipAddress(a.getIpAddress())
                .createdAt(a.getCreatedAt())
                .build()
        ).toList();
    }

    private UserSessionDto toDto(UserSessionEntity s, boolean isCurrent) {
        return UserSessionDto.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .userEmail(s.getUser().getEmail())
                .userDisplayName(s.getUser().getDisplayName())
                .ipAddress(s.getIpAddress())
                .userAgent(s.getUserAgent())
                .deviceType(s.getDeviceType())
                .browser(s.getBrowser())
                .operatingSystem(s.getOperatingSystem())
                .location(s.getLocation())
                .isActive(s.getIsActive())
                .isCurrent(isCurrent)
                .loginAt(s.getLoginAt())
                .lastActivityAt(s.getLastActivityAt())
                .expiresAt(s.getExpiresAt())
                .logoutAt(s.getLogoutAt())
                .build();
    }

    public String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip != null ? ip : "127.0.0.1";
    }

    private String detectDeviceType(String userAgent) {
        if (userAgent == null) return "Desktop";
        String ua = userAgent.toLowerCase();
        if (ua.contains("tablet") || ua.contains("ipad")) return "Tablet";
        if (ua.contains("mobile") || ua.contains("iphone") || ua.contains("android")) return "Mobile";
        return "Desktop";
    }

    private String detectBrowser(String userAgent) {
        if (userAgent == null) return "Unknown Browser";
        String ua = userAgent.toLowerCase();
        if (ua.contains("edg/")) return "Microsoft Edge";
        if (ua.contains("chrome/") && !ua.contains("edg/")) return "Google Chrome";
        if (ua.contains("safari/") && !ua.contains("chrome/")) return "Apple Safari";
        if (ua.contains("firefox/")) return "Mozilla Firefox";
        if (ua.contains("opr/") || ua.contains("opera/")) return "Opera";
        return "Web Browser";
    }

    private String detectOperatingSystem(String userAgent) {
        if (userAgent == null) return "Unknown OS";
        String ua = userAgent.toLowerCase();
        if (ua.contains("windows nt 10.0") || ua.contains("windows nt 11.0")) return "Windows 11 / 10";
        if (ua.contains("windows")) return "Windows";
        if (ua.contains("mac os x")) return "macOS";
        if (ua.contains("android")) return "Android";
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ios")) return "iOS";
        if (ua.contains("linux")) return "Linux";
        return "Unknown OS";
    }

    private String resolveLocation(String ip) {
        if (ip == null || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.") || "127.0.0.1".equals(ip)) {
            return "Localhost (Development Session)";
        }
        return "Connected Network";
    }
}
