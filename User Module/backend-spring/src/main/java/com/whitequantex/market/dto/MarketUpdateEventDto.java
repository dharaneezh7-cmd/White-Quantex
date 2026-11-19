package com.whitequantex.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketUpdateEventDto {
    private String type;
    private long tick;
    private long tickNumber;
    private Instant timestamp;
    private List<MarketIndexDto> indices;
    private Map<String, LiveStockQuoteDto> updates;
    private Map<String, LiveStockQuoteDto> quotes;
}
