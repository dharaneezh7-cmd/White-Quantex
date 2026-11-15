package com.whitequantex.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketHistoryResponseDto {
    private String instrumentId;
    private String symbol;
    private String companyName;
    private String currency;
    private String range;
    private String interval;
    private String dataStatus;
    private String source;
    private Instant lastUpdated;
    private BigDecimal currentPrice;
    private BigDecimal periodStartPrice;
    private BigDecimal periodChange;
    private BigDecimal periodChangePercent;
    private BigDecimal periodHigh;
    private BigDecimal periodLow;
    private Long totalVolume;
    private Integer pointCount;
    private List<PricePointDto> points;
}
