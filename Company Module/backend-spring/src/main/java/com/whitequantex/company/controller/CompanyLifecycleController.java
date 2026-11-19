package com.whitequantex.company.controller;

import com.whitequantex.company.common.ApiResponse;
import com.whitequantex.company.dto.CompanyResponseDto;
import com.whitequantex.company.dto.SubmitGraduationRequestDto;
import com.whitequantex.company.entity.BusinessLifecycleHistoryEntity;
import com.whitequantex.company.entity.CompanyEntity;
import com.whitequantex.company.entity.GraduationApplicationEntity;
import com.whitequantex.company.security.SecurityUtils;
import com.whitequantex.company.service.CompanyLifecycleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies/{companyId}/lifecycle")
@RequiredArgsConstructor
@Tag(name = "Corporate Lifecycle & Graduation", description = "Venture graduation to Established Company (Scenario 6: UUID preservation)")
public class CompanyLifecycleController {

    private final CompanyLifecycleService lifecycleService;

    @PostMapping("/graduate")
    @Operation(summary = "Submit application for startup graduation to Established Company status")
    public ResponseEntity<ApiResponse<GraduationApplicationEntity>> submitGraduation(
            @PathVariable UUID companyId,
            @Valid @RequestBody SubmitGraduationRequestDto request
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        GraduationApplicationEntity app = lifecycleService.submitGraduationApplication(companyId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(app));
    }

    @PostMapping("/graduation/{applicationId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve startup graduation with pessimistic lock and UUID preservation (Scenario 6)")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> approveGraduation(
            @PathVariable UUID companyId,
            @PathVariable UUID applicationId,
            @RequestParam(required = false, defaultValue = "Maturity criteria verified.") String reviewerNotes
    ) {
        UUID reviewerUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyEntity graduated = lifecycleService.approveGraduation(applicationId, reviewerNotes, reviewerUserId);
        return ResponseEntity.ok(ApiResponse.success(CompanyResponseDto.fromEntity(graduated)));
    }

    @GetMapping("/history")
    @Operation(summary = "Get lifecycle classification change history")
    public ResponseEntity<ApiResponse<List<BusinessLifecycleHistoryEntity>>> getLifecycleHistory(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.success(lifecycleService.getLifecycleHistory(companyId)));
    }
}
