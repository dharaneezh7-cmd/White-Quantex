package com.whitequantex.auth;

import com.whitequantex.auth.dto.UserSessionDto;
import com.whitequantex.auth.entity.UserSessionActivityEntity;
import com.whitequantex.auth.entity.UserSessionEntity;
import com.whitequantex.auth.repository.UserSessionActivityRepository;
import com.whitequantex.auth.repository.UserSessionRepository;
import com.whitequantex.auth.service.UserSessionService;
import com.whitequantex.users.entity.UserEntity;
import com.whitequantex.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserSessionServiceTest {

    @Mock
    private UserSessionRepository userSessionRepository;

    @Mock
    private UserSessionActivityRepository userSessionActivityRepository;

    @Mock
    private UserRepository userRepository;

    private UserSessionService userSessionService;

    private UserEntity testUser;
    private final UUID userId = UUID.randomUUID();
    private final String sessionToken = "test-session-jwt-token-xyz123";

    @BeforeEach
    void setUp() {
        userSessionService = new UserSessionService(
                userSessionRepository,
                userSessionActivityRepository,
                userRepository
        );

        testUser = UserEntity.builder()
                .id(userId)
                .email("test.investor@whitequantex.com")
                .firstName("Test")
                .lastName("Investor")
                .displayName("Test Investor")
                .primaryRole("INVESTOR")
                .build();
    }

    @Test
    @DisplayName("Should create active session and record initial LOGIN activity")
    void testCreateSession() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.100");
        request.addHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0");
        request.setRequestURI("/api/auth/login");

        when(userSessionRepository.save(any(UserSessionEntity.class))).thenAnswer(inv -> {
            UserSessionEntity s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        UserSessionEntity session = userSessionService.createSession(testUser, sessionToken, request);

        assertNotNull(session);
        assertEquals("test-session-jwt-token-xyz123", session.getSessionToken());
        assertTrue(session.getIsActive());
        assertEquals("Google Chrome", session.getBrowser());
        assertEquals("Windows 11 / 10", session.getOperatingSystem());

        // Verify LOGIN activity recorded
        ArgumentCaptor<UserSessionActivityEntity> activityCaptor = ArgumentCaptor.forClass(UserSessionActivityEntity.class);
        verify(userSessionActivityRepository).save(activityCaptor.capture());
        UserSessionActivityEntity recordedActivity = activityCaptor.getValue();
        assertEquals("LOGIN", recordedActivity.getActivityType());
        assertEquals("User Authenticated Session", recordedActivity.getActivityName());
    }

    @Test
    @DisplayName("Should validate active session and reject expired or nonexistent session")
    void testIsSessionActive() {
        UserSessionEntity activeSession = UserSessionEntity.builder()
                .sessionToken(sessionToken)
                .isActive(true)
                .expiresAt(Instant.now().plus(Duration.ofDays(7)))
                .build();

        UserSessionEntity expiredSession = UserSessionEntity.builder()
                .sessionToken("expired-token")
                .isActive(true)
                .expiresAt(Instant.now().minus(Duration.ofHours(1)))
                .build();

        when(userSessionRepository.findBySessionTokenAndIsActiveTrue(sessionToken))
                .thenReturn(Optional.of(activeSession));
        when(userSessionRepository.findBySessionTokenAndIsActiveTrue("expired-token"))
                .thenReturn(Optional.of(expiredSession));
        when(userSessionRepository.findBySessionTokenAndIsActiveTrue("missing-token"))
                .thenReturn(Optional.empty());

        assertTrue(userSessionService.isSessionActive(sessionToken));
        assertFalse(userSessionService.isSessionActive("expired-token"));
        assertFalse(userSessionService.isSessionActive("missing-token"));
    }

    @Test
    @DisplayName("Should track user activity and update last_activity_at on session")
    void testRecordActivity() {
        UserSessionEntity session = UserSessionEntity.builder()
                .id(UUID.randomUUID())
                .sessionToken(sessionToken)
                .user(testUser)
                .isActive(true)
                .lastActivityAt(Instant.now().minus(Duration.ofMinutes(10)))
                .expiresAt(Instant.now().plus(Duration.ofDays(1)))
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userSessionRepository.findBySessionToken(sessionToken)).thenReturn(Optional.of(session));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");

        userSessionService.recordActivity(
                userId,
                sessionToken,
                "NAVIGATION",
                "Navigated to Stock Screener",
                "/markets",
                "Filtered by PE < 25",
                request
        );

        // Verify session was touched
        verify(userSessionRepository).save(session);

        // Verify activity saved
        ArgumentCaptor<UserSessionActivityEntity> captor = ArgumentCaptor.forClass(UserSessionActivityEntity.class);
        verify(userSessionActivityRepository).save(captor.capture());
        UserSessionActivityEntity saved = captor.getValue();
        assertEquals("NAVIGATION", saved.getActivityType());
        assertEquals("Navigated to Stock Screener", saved.getActivityName());
        assertEquals("/markets", saved.getPath());
    }

    @Test
    @DisplayName("Should delete user session on logout and record LOGOUT audit activity")
    void testTerminateSessionOnLogout() {
        UserSessionEntity session = UserSessionEntity.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .sessionToken(sessionToken)
                .isActive(true)
                .ipAddress("127.0.0.1")
                .expiresAt(Instant.now().plus(Duration.ofDays(7)))
                .build();

        when(userSessionRepository.findBySessionToken(sessionToken)).thenReturn(Optional.of(session));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/logout");

        userSessionService.terminateSession(sessionToken, request);

        // Verify LOGOUT activity was recorded
        ArgumentCaptor<UserSessionActivityEntity> activityCaptor = ArgumentCaptor.forClass(UserSessionActivityEntity.class);
        verify(userSessionActivityRepository).save(activityCaptor.capture());
        assertEquals("LOGOUT", activityCaptor.getValue().getActivityType());
        assertEquals("User Logged Out", activityCaptor.getValue().getActivityName());

        // Verify user's session was deleted from the database
        verify(userSessionRepository).delete(session);
    }
}
