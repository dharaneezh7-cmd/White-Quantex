package com.whitequantex.explore.controller;

import com.whitequantex.common.ApiResponse;
import com.whitequantex.common.PagedResponse;
import com.whitequantex.explore.dto.*;
import com.whitequantex.explore.service.ExploreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
public class ExploreController {

    private final ExploreService exploreService;

    private UUID resolveUserId(String header) {
        if (header == null || header.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(header.trim());
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<ExploreOverviewDto>> getOverview(
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        ExploreOverviewDto overview = exploreService.getExploreOverview(userId);
        return ResponseEntity.ok(ApiResponse.success(overview, "Explore market overview retrieved"));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<PagedResponse<CompanySummaryDto>>> getCompanies(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "All") String sector,
            @RequestParam(required = false, defaultValue = "All") String tier,
            @RequestParam(required = false) BigDecimal minValuation,
            @RequestParam(required = false) BigDecimal maxValuation,
            @RequestParam(required = false, defaultValue = "ALL") String letter,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        PagedResponse<CompanySummaryDto> result = exploreService.searchCompanies(
                query, sector, tier, minValuation, maxValuation, letter, sortBy, sortDirection, page, size
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Corporate issuers retrieved"));
    }

    @GetMapping("/companies/{identifier}")
    public ResponseEntity<ApiResponse<CompanySummaryDto>> getCompanyById(@PathVariable String identifier) {
        CompanySummaryDto company = null;
        try {
            UUID id = UUID.fromString(identifier);
            company = exploreService.getCompanyById(id);
        } catch (IllegalArgumentException e) {
            company = exploreService.getCompanyByTicker(identifier);
        }
        if (company == null) {
            company = exploreService.getCompanyByTicker(identifier);
        }
        if (company == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(company, "Corporate issuer dossier retrieved"));
    }

    @GetMapping("/positions")
    public ResponseEntity<ApiResponse<List<CorporatePositionDto>>> getPositions(
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        List<CorporatePositionDto> positions = exploreService.getPositions(userId);
        return ResponseEntity.ok(ApiResponse.success(positions, "Corporate positions retrieved"));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<CorporateOrderDto>>> getOrders(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        List<CorporateOrderDto> orders = exploreService.getOrders(userId, status);
        return ResponseEntity.ok(ApiResponse.success(orders, "Corporate orders retrieved"));
    }

    @PostMapping("/recently-viewed/{identifier}")
    public ResponseEntity<ApiResponse<Void>> recordRecentlyViewed(
            @PathVariable String identifier,
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);
        if (userId != null) {
            exploreService.recordRecentlyViewed(userId, identifier);
        }
        return ResponseEntity.ok(ApiResponse.success(null, "View recorded"));
    }

    @GetMapping("/news")
    public ResponseEntity<ApiResponse<List<CorporateNewsDto>>> getNews(
            @RequestParam(required = false, defaultValue = "ALL") String ticker,
            @RequestParam(required = false, defaultValue = "ALL") String category
    ) {
        List<CorporateNewsDto> news = exploreService.getNews(ticker, category);
        return ResponseEntity.ok(ApiResponse.success(news, "Corporate news & notifications retrieved"));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<UpcomingCompanyDto>>> getUpcomingCompanies() {
        List<UpcomingCompanyDto> list = exploreService.getUpcomingCompanies();
        return ResponseEntity.ok(ApiResponse.success(list, "Upcoming corporate issuers retrieved"));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<WqRecommendationDto>>> getWqRecommendations() {
        List<WqRecommendationDto> list = exploreService.getWqRecommendations();
        return ResponseEntity.ok(ApiResponse.success(list, "WQ recommendation companies retrieved"));
    }

    @GetMapping("/schemes")
    public ResponseEntity<ApiResponse<List<MutualSchemeDto>>> getMutualSchemes() {
        List<MutualSchemeDto> list = exploreService.getMutualInvestmentSchemes();
        return ResponseEntity.ok(ApiResponse.success(list, "Mutual investment schemes retrieved"));
    }

    @GetMapping("/schemes/{identifier}")
    public ResponseEntity<ApiResponse<MutualSchemeDto>> getMutualSchemeByIdentifier(@PathVariable String identifier) {
        MutualSchemeDto scheme = null;
        try {
            UUID id = UUID.fromString(identifier);
            scheme = exploreService.getMutualSchemeById(id);
        } catch (IllegalArgumentException e) {
            scheme = exploreService.getMutualSchemeByCode(identifier);
        }
        if (scheme == null) {
            scheme = exploreService.getMutualSchemeByCode(identifier);
        }
        if (scheme == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(scheme, "Mutual investment scheme factsheet retrieved"));
    }
}
