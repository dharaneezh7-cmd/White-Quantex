package com.whitequantex.market.controller;

import com.whitequantex.common.ApiResponse;
import com.whitequantex.market.dto.LiveStockQuoteDto;
import com.whitequantex.market.dto.MarketIndexDto;
import com.whitequantex.market.service.MarketPriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/market", "/api/explore/market"})
@RequiredArgsConstructor
@Slf4j
public class MarketController {

    private final MarketPriceService marketPriceService;

    /**
     * Real-time Server-Sent Events (SSE) live price streaming endpoint.
     * Broadcasts price ticks and market indices every 2.2 seconds.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMarketPrices() {
        return marketPriceService.subscribeStream();
    }

    /**
     * Get snapshot of all live quotes (companies + ventures).
     */
    @GetMapping("/prices")
    public ResponseEntity<ApiResponse<Map<String, LiveStockQuoteDto>>> getAllPrices() {
        return ResponseEntity.ok(ApiResponse.success(marketPriceService.getAllQuotes(), "Live stock quotes retrieved"));
    }

    /**
     * Get stock quotes for corporate issuers (companies only).
     */
    @GetMapping("/stocks")
    public ResponseEntity<ApiResponse<List<LiveStockQuoteDto>>> getStockQuotes() {
        return ResponseEntity.ok(ApiResponse.success(marketPriceService.getCompanyStockQuotes(), "Corporate stock quotes retrieved"));
    }

    /**
     * Get quotes for venture capital rounds / venture issuers.
     */
    @GetMapping("/ventures")
    public ResponseEntity<ApiResponse<List<LiveStockQuoteDto>>> getVentureQuotes() {
        return ResponseEntity.ok(ApiResponse.success(marketPriceService.getVentureQuotes(), "Venture asset quotes retrieved"));
    }

    /**
     * Get live market composite indices (WQ100, WQAI, WQXF, WQGRN).
     */
    @GetMapping("/indices")
    public ResponseEntity<ApiResponse<List<MarketIndexDto>>> getMarketIndices() {
        return ResponseEntity.ok(ApiResponse.success(marketPriceService.computeIndices(System.currentTimeMillis() / 2200), "Market indices retrieved"));
    }

    /**
     * Get live quote for a specific ticker symbol.
     */
    @GetMapping("/quotes/{ticker}")
    public ResponseEntity<ApiResponse<LiveStockQuoteDto>> getQuoteByTicker(@PathVariable String ticker) {
        LiveStockQuoteDto quote = marketPriceService.getQuote(ticker);
        if (quote == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(quote, "Stock quote for " + ticker + " retrieved"));
    }
}
