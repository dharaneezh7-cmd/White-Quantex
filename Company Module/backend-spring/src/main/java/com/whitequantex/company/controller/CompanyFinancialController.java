package com.whitequantex.company.controller;

import com.whitequantex.company.common.ApiResponse;
import com.whitequantex.company.dto.QuarterlyFinancialRequestDto;
import com.whitequantex.company.dto.CompanyQuarterlyFinancialResponseDto;
import com.whitequantex.company.security.SecurityUtils;
import com.whitequantex.company.service.CompanyFinancialService;
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
@RequestMapping("/api/companies/financials")
@RequiredArgsConstructor
@Tag(name = "Corporate Financials", description = "Quarterly financial filings, revenue, and profit updates")
public class CompanyFinancialController {

    private final CompanyFinancialService financialService;

    @PostMapping("/{tickerOrId}")
    @Operation(summary = "Submit quarterly financial performance (Revenue, Profit, Expenses)")
    public ResponseEntity<ApiResponse<CompanyQuarterlyFinancialResponseDto>> submitFinancials(
            @PathVariable String tickerOrId,
            @Valid @RequestBody QuarterlyFinancialRequestDto request
    ) {
        UUID currentUserId = SecurityUtils.getAuthenticatedUserId();
        CompanyQuarterlyFinancialResponseDto response = financialService.submitQuarterlyFinancials(tickerOrId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{ticker}")
    @Operation(summary = "Get historical quarterly financial filings for a ticker")
    public ResponseEntity<ApiResponse<List<CompanyQuarterlyFinancialResponseDto>>> getFinancials(@PathVariable String ticker) {
        return ResponseEntity.ok(ApiResponse.success(financialService.getFinancialHistory(ticker)));
    }
}
