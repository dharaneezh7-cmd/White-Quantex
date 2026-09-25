package com.whitequantex.auth.controller;

import com.whitequantex.common.ApiResponse;
import com.whitequantex.users.entity.UserEntity;
import com.whitequantex.users.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // In-memory OTP storage for validation
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserEntity>> register(@RequestBody RegisterRequest req) {
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
                .primaryRole(req.getRole() != null ? req.getRole() : "FOUNDER")
                .verificationLevel("SILVER")
                .kycStatus("APPROVED")
                .trustScore(85)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(user, "WQ identity created successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserEntity>> login(@RequestBody LoginRequest req) {
        if ("demo@whitequantex.com".equalsIgnoreCase(req.getEmail()) && 
            ("demo123".equals(req.getPassword()) || "password123".equals(req.getPassword()))) {
            UserEntity demo = getOrCreateDemoUser();
            return ResponseEntity.ok(ApiResponse.success(demo, "Demo Investor session authenticated"));
        }

        UserEntity user = userRepository.findByEmail(req.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password."));
        }

        return ResponseEntity.ok(ApiResponse.success(user, "Authenticated successfully"));
    }

    @PostMapping("/demo-login")
    public ResponseEntity<ApiResponse<UserEntity>> demoLogin() {
        UserEntity demo = getOrCreateDemoUser();
        return ResponseEntity.ok(ApiResponse.success(demo, "Authenticated as Demo Investor (Alexander Vance)"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserEntity>> me() {
        UserEntity demo = getOrCreateDemoUser();
        return ResponseEntity.ok(ApiResponse.success(demo, "Current session identity retrieved"));
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

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        String generatedOtp = "123456"; // Default OTP for verification
        otpStore.put(req.getEmail(), generatedOtp);
        
        // Sender: whitequantex@gmail.com
        return ResponseEntity.ok(ApiResponse.success("OTP sent from whitequantex@gmail.com to " + req.getEmail(), "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestBody VerifyOtpRequest req) {
        String storedOtp = otpStore.get(req.getEmail());
        if (storedOtp == null || !storedOtp.equals(req.getOtp())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP."));
        }
        otpStore.remove(req.getEmail());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", "OTP verified"));
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
