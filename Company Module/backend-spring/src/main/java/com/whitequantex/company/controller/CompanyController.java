package com.whitequantex.company.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.whitequantex.company.common.ApiResponse;
import com.whitequantex.company.dto.*;
import com.whitequantex.company.entity.IdempotencyKeyEntity;
import com.whitequantex.company.security.SecurityUtils;
import com.whitequantex.company.service.CompanyService;
import com.whitequantex.company.service.IdempotencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Corporate Entity Controller", description = "Registration, management and lookup of Companies and Ventures")
public class CompanyController {

    private final CompanyService companyService;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    @PostMapping
    @Operation(summary = "Register an established corporate issuer (Scenario 1 & 7: Concurrency & Idempotency guarded)")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> createCompany(
            @Valid @RequestBody CreateCompanyRequestDto request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();

        // Scenario 7: Idempotency Key check
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<IdempotencyKeyEntity> existing = idempotencyService.getRecordedResponse(idempotencyKey, currentUserId);
            if (existing.isPresent()) {
                try {
                    CompanyResponseDto cached = objectMapper.readValue(existing.get().getResponseBody(), CompanyResponseDto.class);
                    return ResponseEntity.status(existing.get().getResponseStatus()).body(ApiResponse.success(cached));
                } catch (Exception ignored) {}
            }
        }

        CompanyResponseDto result = companyService.createCompany(request, currentUserId);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            try {
                idempotencyService.recordResponse(
                        idempotencyKey,
                        currentUserId,
                        "/api/companies",
                        HttpStatus.CREATED.value(),
                        objectMapper.writeValueAsString(result)
                );
            } catch (Exception ignored) {}
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(result));
    }

    @PostMapping("/register")
    @Operation(summary = "Alias for corporate registration")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> registerCompanyAlias(
            @Valid @RequestBody CreateCompanyRequestDto request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey
    ) {
        return createCompany(request, idempotencyKey);
    }

    @PostMapping("/register-venture")
    @Operation(summary = "Alias for venture registration")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> registerVentureAlias(
            @Valid @RequestBody CreateVentureRequestDto request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey
    ) {
        return createVenture(request, idempotencyKey);
    }

    @PostMapping("/ventures")
    @Operation(summary = "Register a venture startup (Scenario 1 & 7)")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> createVenture(
            @Valid @RequestBody CreateVentureRequestDto request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<IdempotencyKeyEntity> existing = idempotencyService.getRecordedResponse(idempotencyKey, currentUserId);
            if (existing.isPresent()) {
                try {
                    CompanyResponseDto cached = objectMapper.readValue(existing.get().getResponseBody(), CompanyResponseDto.class);
                    return ResponseEntity.status(existing.get().getResponseStatus()).body(ApiResponse.success(cached));
                } catch (Exception ignored) {}
            }
        }

        CompanyResponseDto result = companyService.createVenture(request, currentUserId);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            try {
                idempotencyService.recordResponse(
                        idempotencyKey,
                        currentUserId,
                        "/api/companies/ventures",
                        HttpStatus.CREATED.value(),
                        objectMapper.writeValueAsString(result)
                );
            } catch (Exception ignored) {}
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(result));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update corporate profile with optimistic concurrency control (Scenario 3)")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCompanyRequestDto request
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyResponseDto updated = companyService.updateCompany(id, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details by ID")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> getCompanyById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(id)));
    }

    @GetMapping("/ticker/{ticker}")
    @Operation(summary = "Get company or venture by ticker symbol")
    public ResponseEntity<ApiResponse<CompanyResponseDto>> getCompanyByTicker(@PathVariable String ticker) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyByTicker(ticker)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search corporate issuers")
    public ResponseEntity<ApiResponse<Page<CompanyResponseDto>>> searchCompanies(
            @RequestParam(required = false) String query,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.searchCompanies(query, pageable)));
    }

    @GetMapping("/my-companies")
    @Operation(summary = "Retrieve companies and ventures owned by the authenticated corporate user")
    public ResponseEntity<ApiResponse<List<CompanyResponseDto>>> getMyCompanies() {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompaniesOwnedByUser(currentUserId)));
    }

    @GetMapping("/check-ticker/{ticker}")
    @Operation(summary = "Verify if a ticker symbol is available for registration")
    public ResponseEntity<ApiResponse<Boolean>> checkTicker(@PathVariable String ticker) {
        return ResponseEntity.ok(ApiResponse.success(companyService.checkTickerAvailability(ticker)));
    }
}
