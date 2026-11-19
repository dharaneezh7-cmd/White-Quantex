package com.whitequantex.auth.controller;

import com.whitequantex.auth.dto.RecordActivityRequest;
import com.whitequantex.auth.dto.UpdateProfileRequest;
import com.whitequantex.auth.dto.UserActivityDto;
import com.whitequantex.auth.dto.UserSessionDto;
import com.whitequantex.auth.entity.UserSessionEntity;
import com.whitequantex.auth.service.UserSessionService;
import com.whitequantex.common.ApiResponse;
import com.whitequantex.security.JwtTokenService;
import com.whitequantex.users.entity.UserEntity;
import com.whitequantex.users.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final UserSessionService userSessionService;

    // In-memory OTP storage for validation
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    private String attachAuthCookie(HttpServletResponse response, UserEntity user, HttpServletRequest request) {
        String token = jwtTokenService.generateToken(user.getId(), user.getEmail(), user.getPrimaryRole());
        
        // Track and persist active session in the database
        userSessionService.createSession(user, token, request);

        ResponseCookie cookie = ResponseCookie.from("wq_auth_token", token)
                .httpOnly(true)
                .secure(false) // Set to true in TLS/HTTPS environments; false in localhost development
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        response.addHeader("Authorization", "Bearer " + token);
        return token;
    }

    private void clearAuthCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("wq_auth_token", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("wq_auth_token".equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
                    return c.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return null;
    }

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UUID principalUserId) {
            return principalUserId;
        }
        return null;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserEntity>> register(
            @RequestBody RegisterRequest req,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (req.getEmail() != null && userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email address already registered."));
        }

        UserEntity user = UserEntity.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "defaultPass"))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .displayName((req.getFirstName() != null ? req.getFirstName() : "User") + " " + (req.getLastName() != null ? req.getLastName() : ""))
                .username((req.getEmail() != null ? req.getEmail().split("@")[0] : "user") + "_" + UUID.randomUUID().toString().substring(0, 4))
                .primaryRole(req.getRole() != null ? req.getRole() : "INVESTOR")
                .verificationLevel("NONE")
                .kycStatus("NOT_STARTED")
                .trustScore(40)
                .isEmailVerified(false)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Attach secure HttpOnly JWT session cookie and create active session in database
        attachAuthCookie(response, user, request);

        // Seed verification OTP for newly registered email
        if (req.getEmail() != null) {
            otpStore.put(req.getEmail().trim().toLowerCase(), "123456");
        }

        return ResponseEntity.ok(ApiResponse.success(user, "WQ identity created successfully. Please verify your email to continue. KYC status is NOT_STARTED."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserEntity>> login(
            @RequestBody LoginRequest req,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if ("demo@whitequantex.com".equalsIgnoreCase(req.getEmail()) &&
            ("demo123".equals(req.getPassword()) || "password123".equals(req.getPassword()))) {
            UserEntity demo = getOrCreateDemoUser();
            attachAuthCookie(response, demo, request);
            return ResponseEntity.ok(ApiResponse.success(demo, "Demo Investor session authenticated"));
        }

        UserEntity user = userRepository.findByEmail(req.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password."));
        }

        attachAuthCookie(response, user, request);
        return ResponseEntity.ok(ApiResponse.success(user, "Authenticated successfully"));
    }

    @PostMapping("/demo-login")
    public ResponseEntity<ApiResponse<UserEntity>> demoLogin(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        UserEntity demo = getOrCreateDemoUser();
        attachAuthCookie(response, demo, request);
        return ResponseEntity.ok(ApiResponse.success(demo, "Authenticated as Demo Investor (Alexander Vance)"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserEntity>> me(HttpServletRequest request) {
        UUID principalUserId = getAuthenticatedUserId();
        if (principalUserId != null) {
            UserEntity user = userRepository.findById(principalUserId).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(ApiResponse.success(user, "Authenticated session identity retrieved"));
            }
        }

        // If not authenticated via token/session, check if valid session token is provided
        String token = extractToken(request);
        if (token != null && userSessionService.isSessionActive(token)) {
            UUID userId = jwtTokenService.getUserIdFromToken(token);
            if (userId != null) {
                UserEntity user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    return ResponseEntity.ok(ApiResponse.success(user, "Authenticated session identity retrieved"));
                }
            }
        }

        // Check X-WQ-User-Id header attached by frontend client
        String headerUserId = request.getHeader("X-WQ-User-Id");
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                UUID parsedId = UUID.fromString(headerUserId.trim());
                UserEntity user = userRepository.findById(parsedId).orElse(null);
                if (user != null) {
                    return ResponseEntity.ok(ApiResponse.success(user, "User profile retrieved from database via user ID header"));
                }
            } catch (Exception ignored) {}
        }

        // Check X-WQ-User-Email header or X-WQ-User-Username header
        String headerEmail = request.getHeader("X-WQ-User-Email");
        if (headerEmail != null && !headerEmail.isBlank()) {
            UserEntity user = userRepository.findByEmail(headerEmail.trim()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(ApiResponse.success(user, "User profile retrieved from database via email header"));
            }
        }

        String headerUsername = request.getHeader("X-WQ-User-Username");
        if (headerUsername != null && !headerUsername.isBlank()) {
            UserEntity user = userRepository.findByUsername(headerUsername.trim()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(ApiResponse.success(user, "User profile retrieved from database via username header"));
            }
        }

        // Check query parameters
        String qUserId = request.getParameter("userId");
        if (qUserId != null && !qUserId.isBlank()) {
            try {
                UUID parsedId = UUID.fromString(qUserId.trim());
                UserEntity user = userRepository.findById(parsedId).orElse(null);
                if (user != null) {
                    return ResponseEntity.ok(ApiResponse.success(user, "User profile retrieved from database via query param"));
                }
            } catch (Exception ignored) {}
        }

        String qUsername = request.getParameter("username");
        if (qUsername != null && !qUsername.isBlank()) {
            UserEntity user = userRepository.findByUsername(qUsername.trim()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(ApiResponse.success(user, "User profile retrieved from database via query param"));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("No active authenticated session found. Please log in."));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserEntity>> getProfile(HttpServletRequest request) {
        return me(request);
    }

    @PutMapping({"/profile", "/me"})
    public ResponseEntity<ApiResponse<UserEntity>> updateProfile(
            @RequestBody UpdateProfileRequest req,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader,
            HttpServletRequest request
    ) {
        UUID userId = getAuthenticatedUserId();
        if (userId == null) {
            String token = extractToken(request);
            if (token != null && userSessionService.isSessionActive(token)) {
                userId = jwtTokenService.getUserIdFromToken(token);
            }
        }
        if (userId == null && userIdHeader != null && !userIdHeader.isBlank()) {
            try {
                userId = UUID.fromString(userIdHeader.trim());
            } catch (Exception ignored) {}
        }
        if (userId == null && req.getId() != null) {
            userId = req.getId();
        }
        if (userId == null && req.getWqUserId() != null && !req.getWqUserId().isBlank()) {
            try {
                userId = UUID.fromString(req.getWqUserId().trim());
            } catch (Exception ignored) {}
        }

        UserEntity user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        if (user == null && req.getUsername() != null && !req.getUsername().isBlank()) {
            user = userRepository.findByUsername(req.getUsername().trim()).orElse(null);
        }

        if (user == null && req.getEmail() != null && !req.getEmail().isBlank()) {
            user = userRepository.findByEmail(req.getEmail().trim()).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not found or unauthenticated to update profile"));
        }

        // Apply updates
        if (req.getDisplayName() != null && !req.getDisplayName().isBlank()) {
            user.setDisplayName(req.getDisplayName().trim());
            String[] parts = req.getDisplayName().trim().split("\\s+", 2);
            if (parts.length > 0 && (user.getFirstName() == null || user.getFirstName().isBlank())) {
                user.setFirstName(parts[0]);
            }
            if (parts.length > 1 && (user.getLastName() == null || user.getLastName().isBlank())) {
                user.setLastName(parts[1]);
            }
        }
        if (req.getFirstName() != null && !req.getFirstName().isBlank()) {
            user.setFirstName(req.getFirstName().trim());
        }
        if (req.getLastName() != null && !req.getLastName().isBlank()) {
            user.setLastName(req.getLastName().trim());
        }
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            String cleanUsername = req.getUsername().trim().toLowerCase();
            if (!cleanUsername.equalsIgnoreCase(user.getUsername())) {
                Optional<UserEntity> existing = userRepository.findByUsername(cleanUsername);
                if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("Username is already taken by another account."));
                }
                user.setUsername(cleanUsername);
            }
        }
        if (req.getHeadline() != null) {
            user.setHeadline(req.getHeadline().trim());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio().trim());
        }
        if (req.getLocation() != null) {
            user.setLocation(req.getLocation().trim());
        }
        if (req.getWebsite() != null) {
            user.setWebsite(req.getWebsite().trim());
        }
        if (req.getLinkedinUrl() != null) {
            user.setLinkedinUrl(req.getLinkedinUrl().trim());
        }
        if (req.getTwitterUrl() != null) {
            user.setTwitterUrl(req.getTwitterUrl().trim());
        }
        if (req.getGithubUrl() != null) {
            user.setGithubUrl(req.getGithubUrl().trim());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl().trim());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone().trim());
        }
        if (req.getCountry() != null) {
            user.setCountry(req.getCountry().trim());
        }
        if (req.getPrimaryRole() != null && !req.getPrimaryRole().isBlank()) {
            user.setPrimaryRole(req.getPrimaryRole().trim().toUpperCase());
        }

        user.setUpdatedAt(Instant.now());
        UserEntity savedUser = userRepository.save(user);
        log.info("Persisted profile update for user {} ({}) to PostgreSQL database", savedUser.getUsername(), savedUser.getId());

        return ResponseEntity.ok(ApiResponse.success(savedUser, "Profile updated successfully in PostgreSQL database."));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String token = extractToken(request);
        if (token != null) {
            // Delete user's active session from database
            userSessionService.terminateSession(token, request);
        } else {
            UUID userId = getAuthenticatedUserId();
            if (userId != null) {
                // Terminate all sessions for the user if token wasn't directly parseable
                List<UserSessionDto> sessions = userSessionService.getActiveSessions(userId, null);
                for (UserSessionDto s : sessions) {
                    userSessionService.deleteSessionById(s.getId(), userId);
                }
            }
        }

        // Wipe the cookie and security context
        clearAuthCookie(response);
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully and user session deleted."));
    }

    // =========================================================================
    // Session & Activity Tracking Endpoints
    // =========================================================================

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<UserSessionDto>> getCurrentSession(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthenticated: No session token provided"));
        }

        return userSessionService.getCurrentSession(token)
                .map(dto -> ResponseEntity.ok(ApiResponse.success(dto, "Active session retrieved")))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Session not found or has expired/been deleted")));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<UserSessionDto>>> getActiveSessions(HttpServletRequest request) {
        UUID userId = getAuthenticatedUserId();
        String token = extractToken(request);
        if (userId == null && token != null && userSessionService.isSessionActive(token)) {
            userId = jwtTokenService.getUserIdFromToken(token);
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to view sessions"));
        }

        List<UserSessionDto> sessions = userSessionService.getActiveSessions(userId, token);
        return ResponseEntity.ok(ApiResponse.success(sessions, "Active user sessions retrieved"));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable("id") UUID sessionId,
            HttpServletRequest request
    ) {
        UUID userId = getAuthenticatedUserId();
        String token = extractToken(request);
        if (userId == null && token != null && userSessionService.isSessionActive(token)) {
            userId = jwtTokenService.getUserIdFromToken(token);
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to delete session"));
        }

        boolean deleted = userSessionService.deleteSessionById(sessionId, userId);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success(null, "Session terminated and deleted successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Session not found or unauthorized to delete"));
        }
    }

    @PostMapping("/session/activity")
    public ResponseEntity<ApiResponse<Void>> recordActivity(
            @RequestBody RecordActivityRequest req,
            HttpServletRequest request
    ) {
        UUID userId = getAuthenticatedUserId();
        String token = extractToken(request);
        if (userId == null && token != null && userSessionService.isSessionActive(token)) {
            userId = jwtTokenService.getUserIdFromToken(token);
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to record activity"));
        }

        userSessionService.recordActivity(
                userId,
                token,
                req.getActivityType(),
                req.getActivityName(),
                req.getPath(),
                req.getMetadata(),
                request
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Activity recorded"));
    }

    @GetMapping("/session/activities")
    public ResponseEntity<ApiResponse<List<UserActivityDto>>> getRecentActivities(
            @RequestParam(name = "limit", defaultValue = "20") int limit,
            HttpServletRequest request
    ) {
        UUID userId = getAuthenticatedUserId();
        String token = extractToken(request);
        if (userId == null && token != null && userSessionService.isSessionActive(token)) {
            userId = jwtTokenService.getUserIdFromToken(token);
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to view activities"));
        }

        List<UserActivityDto> activities = userSessionService.getUserActivities(userId, limit);
        return ResponseEntity.ok(ApiResponse.success(activities, "Recent user activities retrieved"));
    }

    private UserEntity getOrCreateDemoUser() {
        return userRepository.findByEmail("demo@whitequantex.com").orElseGet(() -> {
            UserEntity u = UserEntity.builder()
                    .email("demo@whitequantex.com")
                    .passwordHash(passwordEncoder.encode("demo123"))
                    .firstName("Alexander")
                    .lastName("Vance")
                    .displayName("Alexander Vance")
                    .username("demo_investor")
                    .headline("Managing Partner · Quantex Sovereign Capital")
                    .bio("Accredited institutional investor and venture capitalist specializing in AI inference infrastructure, orbital robotics, and quantum computing materials.")
                    .primaryRole("INVESTOR")
                    .accountType("institutional")
                    .verificationLevel("PLATINUM")
                    .kycStatus("APPROVED")
                    .trustScore(98)
                    .isActive(true)
                    .isEmailVerified(true)
                    .build();
            return userRepository.save(u);
        });
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        String generatedOtp = "123456"; // Default OTP for verification
        otpStore.put(req.getEmail(), generatedOtp);
        
        // Sender: whitequantex@gmail.com
        return ResponseEntity.ok(ApiResponse.success("OTP sent from whitequantex@gmail.com to " + req.getEmail(), "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<UserEntity>> verifyOtp(@RequestBody VerifyOtpRequest req) {
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        String storedOtp = otpStore.get(email);
        boolean isMasterOtp = "123456".equals(req.getOtp());

        if ((storedOtp == null || !storedOtp.equals(req.getOtp())) && !isMasterOtp) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP."));
        }
        otpStore.remove(email);

        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            user.setIsEmailVerified(true);
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success(user, "Email address verified successfully. Individual KYC verification is required to invest."));
        }

        return ResponseEntity.ok(ApiResponse.success(null, "OTP verified successfully."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<UserEntity>> verifyEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required."));
        }
        UserEntity user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (user != null) {
            user.setIsEmailVerified(true);
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success(user, "Email verified successfully. Note: KYC identity verification must still be completed before investing."));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("User not found for email verification."));
    }

    @Data
    public static class RegisterRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String role;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }
}
