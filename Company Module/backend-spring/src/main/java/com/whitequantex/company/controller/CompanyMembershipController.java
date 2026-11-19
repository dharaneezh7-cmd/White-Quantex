package com.whitequantex.company.controller;

import com.whitequantex.company.common.ApiResponse;
import com.whitequantex.company.dto.*;
import com.whitequantex.company.security.SecurityUtils;
import com.whitequantex.company.service.CompanyMembershipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies/{companyId}/members")
@RequiredArgsConstructor
@Tag(name = "Corporate Memberships", description = "Member management, roles and ownership transfers (Scenario 2 & 4)")
public class CompanyMembershipController {

    private final CompanyMembershipService membershipService;

    @GetMapping
    @Operation(summary = "List all corporate team members")
    public ResponseEntity<ApiResponse<List<CompanyMembershipResponseDto>>> getMembers(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.success(membershipService.getCompanyMembers(companyId)));
    }

    @PostMapping
    @Operation(summary = "Add team member (Scenario 2: Protected against duplicate membership race conditions)")
    public ResponseEntity<ApiResponse<CompanyMembershipResponseDto>> addMember(
            @PathVariable UUID companyId,
            @Valid @RequestBody AddMemberRequestDto request
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyMembershipResponseDto response = membershipService.addMember(companyId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{memberId}")
    @Operation(summary = "Update member role and permissions")
    public ResponseEntity<ApiResponse<CompanyMembershipResponseDto>> updateMember(
            @PathVariable UUID companyId,
            @PathVariable UUID memberId,
            @Valid @RequestBody UpdateMemberRoleRequestDto request
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyMembershipResponseDto response = membershipService.updateMemberRole(companyId, memberId, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{memberId}")
    @Operation(summary = "Remove corporate team member")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID companyId,
            @PathVariable UUID memberId
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        membershipService.removeMember(companyId, memberId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed successfully"));
    }

    @PostMapping("/transfer-ownership")
    @Operation(summary = "Transfer corporate ownership (Scenario 4: Pessimistic write locking)")
    public ResponseEntity<ApiResponse<Void>> transferOwnership(
            @PathVariable UUID companyId,
            @Valid @RequestBody TransferOwnershipRequestDto request
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        membershipService.transferOwnership(companyId, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null, "Corporate ownership transferred successfully"));
    }
}
