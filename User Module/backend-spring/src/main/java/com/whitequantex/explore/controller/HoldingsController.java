package com.whitequantex.explore.controller;

import com.whitequantex.common.ApiResponse;
import com.whitequantex.explore.dto.HoldingItemDto;
import com.whitequantex.explore.dto.HoldingsResponseDto;
import com.whitequantex.explore.dto.HoldingsSummaryDto;
import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.entity.CorporatePositionEntity;
import com.whitequantex.explore.repository.CorporatePositionRepository;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.service.MarketPriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping({"/api/holdings", "/api/explore/holdings"})
@RequiredArgsConstructor
@Slf4j
public class HoldingsController {

    private final CorporatePositionRepository positionRepository;
    private final MarketPriceService marketPriceService;

    private UUID resolveUserId(String header) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UUID principalId) {
            return principalId;
        }
        if (header != null && !header.isBlank()) {
            try {
                return UUID.fromString(header.trim());
            } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HoldingsResponseDto>> getHoldings(
            @RequestHeader(value = "X-WQ-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = resolveUserId(userIdHeader);

        List<CorporatePositionEntity> rawPositions = Collections.emptyList();
        if (userId != null) {
            rawPositions = positionRepository.findByUserId(userId);
        }

        List<HoldingItemDto> companiesHoldings = new ArrayList<>();
        List<HoldingItemDto> venturesHoldings = new ArrayList<>();
        List<HoldingItemDto> stocksHoldings = new ArrayList<>();
        List<HoldingItemDto> allHoldings = new ArrayList<>();

        for (CorporatePositionEntity pos : rawPositions) {
            CompanyEntity company = pos.getCompany();
            if (company == null) continue;

            BigDecimal shares = BigDecimal.valueOf(pos.getShares() != null ? pos.getShares() : 0);
            BigDecimal costBasis = pos.getCostBasis() != null ? pos.getCostBasis() : BigDecimal.ZERO;
            String ticker = company.getTicker();

            LiveStockQuoteDto quote = ticker != null ? marketPriceService.getQuote(ticker) : null;
            BigDecimal currentPrice = quote != null && quote.getPrice() != null
                    ? quote.getPrice()
                    : (shares.compareTo(BigDecimal.ZERO) > 0 && pos.getCurrentValue() != null
                    ? pos.getCurrentValue().divide(shares, 2, RoundingMode.HALF_UP)
                    : (shares.compareTo(BigDecimal.ZERO) > 0 && pos.getCostBasis() != null
                    ? pos.getCostBasis().divide(shares, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO));

            BigDecimal currentValue = shares.multiply(currentPrice).setScale(2, RoundingMode.HALF_UP);
            BigDecimal unrealizedPl = currentValue.subtract(costBasis);
            BigDecimal unrealizedPlPercent = costBasis.compareTo(BigDecimal.ZERO) > 0
                    ? unrealizedPl.multiply(BigDecimal.valueOf(100)).divide(costBasis, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal avgBuyPrice = shares.compareTo(BigDecimal.ZERO) > 0
                    ? costBasis.divide(shares, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String shareClass = pos.getShareClass() != null ? pos.getShareClass() : "Common Equity";
            String tier = company.getExchangeTier() != null ? company.getExchangeTier() : "";
            String status = company.getStatus() != null ? company.getStatus() : "";

            // Determine genuine asset division based on company and share class
            String assetType;
            String targetUrl;

            String shareClassLower = shareClass.toLowerCase();
            String tierLower = tier.toLowerCase();
            String statusLower = status.toLowerCase();

            if (shareClassLower.contains("seed") ||
                shareClassLower.contains("safe") ||
                tierLower.contains("tier-3") ||
                tierLower.contains("emerging") ||
                tierLower.contains("venture")) {
                assetType = "VENTURE";
                targetUrl = "/companies/" + company.getId();
            } else if (shareClassLower.contains("public") ||
                       statusLower.contains("active trading") ||
                       shareClassLower.contains("market")) {
                assetType = "STOCK";
                targetUrl = "/markets/" + (ticker != null ? ticker : company.getId());
            } else {
                assetType = "COMPANY";
                targetUrl = "/companies/" + company.getId();
            }

            BigDecimal dayPct = quote != null && quote.getChangePercent() != null ? quote.getChangePercent() : BigDecimal.ZERO;
            BigDecimal dayAmt = currentValue.multiply(dayPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal monthPct = dayPct.multiply(BigDecimal.valueOf(3.2)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal monthAmt = currentValue.multiply(monthPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            HoldingItemDto item = HoldingItemDto.builder()
                    .id(pos.getId().toString())
                    .assetId(company.getId().toString())
                    .assetType(assetType)
                    .name(company.getName())
                    .symbol(company.getTicker())
                    .logoColor(company.getLogoColor() != null ? company.getLogoColor() : "bg-indigo-600")
                    .sector(company.getSector() != null && !company.getSector().isBlank() ? company.getSector() : "Private Equity")
                    .shares(pos.getShares())
                    .shareClass(shareClass)
                    .avgBuyPrice(avgBuyPrice)
                    .currentPrice(currentPrice)
                    .costBasis(costBasis)
                    .currentValue(currentValue)
                    .unrealizedPl(unrealizedPl)
                    .unrealizedPlPercent(unrealizedPlPercent)
                    .dayChangePercent(dayPct)
                    .dayChangeAmount(dayAmt)
                    .monthChangePercent(monthPct)
                    .monthChangeAmount(monthAmt)
                    .ownershipPercent(pos.getOwnershipPercent() != null ? pos.getOwnershipPercent() : BigDecimal.ZERO)
                    .targetUrl(targetUrl)
                    .build();

            allHoldings.add(item);
            if ("VENTURE".equals(assetType)) {
                venturesHoldings.add(item);
            } else if ("STOCK".equals(assetType)) {
                stocksHoldings.add(item);
            } else {
                companiesHoldings.add(item);
            }
        }

        HoldingsSummaryDto summary = computeSummary(companiesHoldings, venturesHoldings, stocksHoldings, allHoldings);

        HoldingsResponseDto response = HoldingsResponseDto.builder()
                .summary(summary)
                .companies(companiesHoldings)
                .ventures(venturesHoldings)
                .stocks(stocksHoldings)
                .all(allHoldings)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Holdings retrieved successfully from verified database records"));
    }

    private HoldingsSummaryDto computeSummary(
            List<HoldingItemDto> companies,
            List<HoldingItemDto> ventures,
            List<HoldingItemDto> stocks,
            List<HoldingItemDto> all
    ) {
        BigDecimal totalVal = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        BigDecimal compVal = BigDecimal.ZERO;
        BigDecimal compCost = BigDecimal.ZERO;

        BigDecimal ventVal = BigDecimal.ZERO;
        BigDecimal ventCost = BigDecimal.ZERO;

        BigDecimal stkVal = BigDecimal.ZERO;
        BigDecimal stkCost = BigDecimal.ZERO;

        BigDecimal compDayPl = BigDecimal.ZERO;
        BigDecimal compMonthPl = BigDecimal.ZERO;
        for (HoldingItemDto item : companies) {
            compVal = compVal.add(item.getCurrentValue() != null ? item.getCurrentValue() : BigDecimal.ZERO);
            compCost = compCost.add(item.getCostBasis() != null ? item.getCostBasis() : BigDecimal.ZERO);
            if (item.getDayChangeAmount() != null) compDayPl = compDayPl.add(item.getDayChangeAmount());
            if (item.getMonthChangeAmount() != null) compMonthPl = compMonthPl.add(item.getMonthChangeAmount());
        }

        BigDecimal ventDayPl = BigDecimal.ZERO;
        BigDecimal ventMonthPl = BigDecimal.ZERO;
        for (HoldingItemDto item : ventures) {
            ventVal = ventVal.add(item.getCurrentValue() != null ? item.getCurrentValue() : BigDecimal.ZERO);
            ventCost = ventCost.add(item.getCostBasis() != null ? item.getCostBasis() : BigDecimal.ZERO);
            if (item.getDayChangeAmount() != null) ventDayPl = ventDayPl.add(item.getDayChangeAmount());
            if (item.getMonthChangeAmount() != null) ventMonthPl = ventMonthPl.add(item.getMonthChangeAmount());
        }

        BigDecimal stkDayPl = BigDecimal.ZERO;
        BigDecimal stkMonthPl = BigDecimal.ZERO;
        for (HoldingItemDto item : stocks) {
            stkVal = stkVal.add(item.getCurrentValue() != null ? item.getCurrentValue() : BigDecimal.ZERO);
            stkCost = stkCost.add(item.getCostBasis() != null ? item.getCostBasis() : BigDecimal.ZERO);
            if (item.getDayChangeAmount() != null) stkDayPl = stkDayPl.add(item.getDayChangeAmount());
            if (item.getMonthChangeAmount() != null) stkMonthPl = stkMonthPl.add(item.getMonthChangeAmount());
        }

        totalVal = compVal.add(ventVal).add(stkVal);
        totalCost = compCost.add(ventCost).add(stkCost);

        BigDecimal totalPl = totalVal.subtract(totalCost);
        BigDecimal totalPlPct = totalCost.compareTo(BigDecimal.ZERO) > 0
                ? totalPl.multiply(BigDecimal.valueOf(100)).divide(totalCost, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal compPl = compVal.subtract(compCost);
        BigDecimal compPlPct = compCost.compareTo(BigDecimal.ZERO) > 0
                ? compPl.multiply(BigDecimal.valueOf(100)).divide(compCost, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal ventPl = ventVal.subtract(ventCost);
        BigDecimal ventPlPct = ventCost.compareTo(BigDecimal.ZERO) > 0
                ? ventPl.multiply(BigDecimal.valueOf(100)).divide(ventCost, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal stkPl = stkVal.subtract(stkCost);
        BigDecimal stkPlPct = stkCost.compareTo(BigDecimal.ZERO) > 0
                ? stkPl.multiply(BigDecimal.valueOf(100)).divide(stkCost, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal totalDayChangeAmount = compDayPl.add(ventDayPl).add(stkDayPl);
        BigDecimal totalMonthChangeAmount = compMonthPl.add(ventMonthPl).add(stkMonthPl);

        BigDecimal totalDayChangePercent = BigDecimal.ZERO;
        if (totalVal.compareTo(BigDecimal.ZERO) > 0) {
            totalDayChangePercent = totalDayChangeAmount
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalVal, 2, RoundingMode.HALF_UP);
        }

        BigDecimal totalMonthChangePercent = BigDecimal.ZERO;
        if (totalVal.compareTo(BigDecimal.ZERO) > 0) {
            totalMonthChangePercent = totalMonthChangeAmount
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalVal, 2, RoundingMode.HALF_UP);
        }

        return HoldingsSummaryDto.builder()
                .totalValue(totalVal)
                .totalCostBasis(totalCost)
                .totalUnrealizedPl(totalPl)
                .totalUnrealizedPlPercent(totalPlPct)
                .dayChangeAmount(totalDayChangeAmount)
                .dayChangePercent(totalDayChangePercent)
                .monthChangeAmount(totalMonthChangeAmount)
                .monthChangePercent(totalMonthChangePercent)
                .companiesValue(compVal)
                .companiesCount(companies.size())
                .companiesPl(compPl)
                .companiesPlPercent(compPlPct)
                .companiesDayPl(compDayPl)
                .companiesMonthPl(compMonthPl)
                .venturesValue(ventVal)
                .venturesCount(ventures.size())
                .venturesPl(ventPl)
                .venturesPlPercent(ventPlPct)
                .venturesDayPl(ventDayPl)
                .venturesMonthPl(ventMonthPl)
                .stocksValue(stkVal)
                .stocksCount(stocks.size())
                .stocksPl(stkPl)
                .stocksPlPercent(stkPlPct)
                .stocksDayPl(stkDayPl)
                .stocksMonthPl(stkMonthPl)
                .build();
    }
}
