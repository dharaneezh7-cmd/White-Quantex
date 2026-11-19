package com.whitequantex.company.controller;

import com.whitequantex.company.common.ApiResponse;
import com.whitequantex.company.dto.*;
import com.whitequantex.company.security.SecurityUtils;
import com.whitequantex.company.service.CompanyVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies/{companyId}/verification")
@RequiredArgsConstructor
@Tag(name = "Corporate Verifications", description = "SEC 506(c) & Institutional Verification Workflows (Scenario 5)")
public class CompanyVerificationController {

    private final CompanyVerificationService verificationService;

    @PostMapping
    @Operation(summary = "Submit corporate verification application (Scenario 5: Race-condition protected)")
    public ResponseEntity<ApiResponse<CompanyVerificationResponseDto>> submitVerification(
            @PathVariable UUID companyId,
            @Valid @RequestBody SubmitVerificationRequestDto request
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyVerificationResponseDto response = verificationService.submitVerification(companyId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get verification history for corporate entity")
    public ResponseEntity<ApiResponse<List<CompanyVerificationResponseDto>>> getVerifications(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.success(verificationService.getCompanyVerifications(companyId)));
    }

    @PutMapping("/{verificationId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Review and adjudicate corporate verification (Scenario 5: Pessimistic write locking)")
    public ResponseEntity<ApiResponse<CompanyVerificationResponseDto>> reviewVerification(
            @PathVariable UUID companyId,
            @PathVariable UUID verificationId,
            @Valid @RequestBody ReviewVerificationRequestDto request
    ) {
        UUID reviewerUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyVerificationResponseDto response = verificationService.reviewVerification(verificationId, request, reviewerUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/pending-reviews")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin lookup of all pending corporate verifications")
    public ResponseEntity<ApiResponse<Page<CompanyVerificationResponseDto>>> getPendingReviews(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(verificationService.getPendingVerifications(pageable)));
    }
}
