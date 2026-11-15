package com.whitequantex.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketStatisticsDto {
    private String symbol;
    private BigDecimal currentPrice;
    private BigDecimal dayOpen;
    private BigDecimal dayHigh;
    private BigDecimal dayLow;
    private BigDecimal prevClose;
    private BigDecimal changeAmount;
    private BigDecimal changePercent;
    private BigDecimal high52w;
    private BigDecimal low52w;
    private Long volume;
    private String marketCap;
    private String peRatio;
    private String beta;
    private String currency;
    private String marketStatus;
    private String exchange;
}
