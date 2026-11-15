package com.whitequantex.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveStockQuoteDto {
    private UUID id;
    private String ticker;
    private String name;
    private String shortName;
    private String sector;
    private String logoColor;
    private BigDecimal price;
    private String priceStr;
    private BigDecimal changePercent;
    private String changePercentStr;
    private BigDecimal changeAmount;
    private String changeAmountStr;
    private Boolean isPositive;
    private String direction; // "UP", "DOWN", "FLAT"
    private BigDecimal openPrice;
    private BigDecimal high24h;
    private BigDecimal low24h;
    private BigDecimal high52w;
    private BigDecimal low52w;
    private Long volumeShares;
    private String volumeStr;
    private String valuation;
    private BigDecimal valuationNum;
    private String exchangeTier;
    private Boolean isVenture;
    private Instant lastUpdated;
}
