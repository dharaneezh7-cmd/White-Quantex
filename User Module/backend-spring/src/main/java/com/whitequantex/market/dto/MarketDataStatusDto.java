package com.whitequantex.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketDataStatusDto {
    private String symbol;
    private String status;
    private String provider;
    private Instant lastUpdated;
    private boolean isTradingOpen;
    private String exchange;
    private String message;
}
