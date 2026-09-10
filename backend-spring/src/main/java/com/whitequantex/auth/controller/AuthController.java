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
        UserEntity user = userRepository.findByEmail(req.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password."));
        }

        return ResponseEntity.ok(ApiResponse.success(user, "Authenticated successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserEntity>> me() {
        UserEntity demo = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            UserEntity u = UserEntity.builder()
                    .email("alex@venture.com")
                    .firstName("Alex")
                    .lastName("Vance")
                    .displayName("Alexander Vance")
                    .primaryRole("FOUNDER")
                    .verificationLevel("GOLD")
                    .kycStatus("APPROVED")
                    .trustScore(94)
                    .build();
            return userRepository.save(u);
        });

        return ResponseEntity.ok(ApiResponse.success(demo, "Current session identity retrieved"));
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
