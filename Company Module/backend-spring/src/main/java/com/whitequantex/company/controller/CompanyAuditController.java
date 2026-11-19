package com.whitequantex.company.controller;

import com.whitequantex.company.common.ApiResponse;
import com.whitequantex.company.dto.CompanyAuditLogResponseDto;
import com.whitequantex.company.repository.CompanyAuditLogRepository;
import com.whitequantex.company.security.SecurityUtils;
import com.whitequantex.company.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/companies/{companyId}/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Corporate Audit Trail", description = "Immutable audit logs for corporate actions")
public class CompanyAuditController {

    private final CompanyAuditLogRepository auditLogRepository;
    private final CompanyService companyService;

    @GetMapping
    @Operation(summary = "Get paginated corporate audit log trail")
    public ResponseEntity<ApiResponse<Page<CompanyAuditLogResponseDto>>> getAuditLogs(
            @PathVariable UUID companyId,
            Pageable pageable
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        companyService.assertIsAdminOrOwner(companyId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(
                auditLogRepository.findAllByCompanyIdOrderByCreatedAtDesc(companyId, pageable)
                        .map(CompanyAuditLogResponseDto::fromEntity)
        ));
    }
}
