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
public class MarketIndexDto {
    private String symbol;
    private String name;
    private BigDecimal value;
    private String valueStr;
    private BigDecimal changePercent;
    private String changeStr;
    private Boolean isPositive;
    private String volume;
}
