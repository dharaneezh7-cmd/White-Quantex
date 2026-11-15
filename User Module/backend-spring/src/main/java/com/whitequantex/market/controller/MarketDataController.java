package com.whitequantex.market.controller;

import com.whitequantex.explore.entity.CompanyEntity;
import com.whitequantex.explore.repository.CompanyRepository;
import com.whitequantex.market.dto.*;
import com.whitequantex.market.entity.CompanyPriceCurrentEntity;
import com.whitequantex.market.repository.CompanyPriceCurrentRepository;
import com.whitequantex.market.service.HistoricalBackfillService;
import com.whitequantex.market.service.HistoricalPriceService;
import com.whitequantex.market.service.MarketPriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/v1/market-data", "/api/market/data"})
@RequiredArgsConstructor
@Slf4j
public class MarketDataController {

    private final HistoricalPriceService historicalPriceService;
    private final HistoricalBackfillService backfillService;
    private final CompanyPriceCurrentRepository currentRepo;
    private final MarketPriceService marketPriceService;
    private final CompanyRepository companyRepository;

    @GetMapping("/instruments/{symbol}/latest")
    public ResponseEntity<Map<String, Object>> getLatestPrice(@PathVariable String symbol) {
        String s = symbol.toUpperCase().trim();
        LiveStockQuoteDto liveQuote = marketPriceService.getQuote(s);
        if (liveQuote != null) {
            return ResponseEntity.ok(Map.of("success", true, "data", liveQuote));
        }

        Optional<CompanyPriceCurrentEntity> currentOpt = currentRepo.findBySymbolIgnoreCase(s);
        if (currentOpt.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "data", currentOpt.get()));
        }

        return ResponseEntity.ok(Map.of("success", false, "message", "Symbol not found: " + symbol));
    }

    @GetMapping("/instruments/{symbol}/history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1M") String range
    ) {
        MarketHistoryResponseDto history = historicalPriceService.getHistoricalData(symbol, range);
        return ResponseEntity.ok(Map.of("success", true, "data", history));
    }

    @GetMapping("/instruments/{symbol}/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(@PathVariable String symbol) {
        MarketStatisticsDto stats = historicalPriceService.getStatistics(symbol);
        return ResponseEntity.ok(Map.of("success", true, "data", stats));
    }

    @GetMapping("/instruments/{symbol}/status")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String symbol) {
        MarketDataStatusDto status = historicalPriceService.getStatus(symbol);
        return ResponseEntity.ok(Map.of("success", true, "data", status));
    }

    @PostMapping("/instruments/{symbol}/backfill")
    public ResponseEntity<Map<String, Object>> triggerBackfill(@PathVariable String symbol) {
        Optional<CompanyEntity> comp = companyRepository.findByTickerIgnoreCase(symbol.toUpperCase().trim());
        if (comp.isPresent()) {
            backfillService.backfillCompany(comp.get());
            return ResponseEntity.ok(Map.of("success", true, "message", "Historical backfill initiated for " + symbol));
        }
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Company not found for symbol: " + symbol));
    }
}
