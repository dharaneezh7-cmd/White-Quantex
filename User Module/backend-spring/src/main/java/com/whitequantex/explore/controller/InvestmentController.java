package com.whitequantex.explore.controller;

import com.whitequantex.common.ApiResponse;
import com.whitequantex.explore.dto.CorporateOrderDto;
import com.whitequantex.explore.dto.CreateOrderRequest;
import com.whitequantex.explore.service.ExploreService;
import com.whitequantex.users.entity.UserEntity;
import com.whitequantex.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final ExploreService exploreService;
    private final UserRepository userRepository;

    private UUID resolveUserId(String header) {
        // Priority 1: Verified cryptographic principal from SecurityContext (OWASP IDOR defense)
        org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UUID principalId) {
            return principalId;
        }

        if (header == null || header.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(header.trim());
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createInvestment(
            @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required to invest in companies"));
        }

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authenticated user account not found"));
        }

        if (!"APPROVED".equalsIgnoreCase(user.getKycStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("KYC verification required. Complete and get your identity verified to unlock investment access."));
        }

        CorporateOrderDto order = exploreService.createOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success(order, "Investment order placed successfully"));
    }
}
