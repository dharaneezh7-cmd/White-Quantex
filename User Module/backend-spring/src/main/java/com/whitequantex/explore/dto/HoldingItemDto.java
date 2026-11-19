package com.whitequantex.explore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldingItemDto {
    private String id;
    private String assetId;
    private String assetType; // "COMPANY", "VENTURE", "STOCK"
    private String name;
    private String symbol;
    private String logoColor;
    private String sector;
    private Long shares;
    private String shareClass;
    private BigDecimal avgBuyPrice;
    private BigDecimal currentPrice;
    private BigDecimal costBasis;
    private BigDecimal currentValue;
    private BigDecimal unrealizedPl;
    private BigDecimal unrealizedPlPercent;
    private BigDecimal dayChangePercent;
    private BigDecimal dayChangeAmount;
    private BigDecimal monthChangePercent;
    private BigDecimal monthChangeAmount;
    private BigDecimal ownershipPercent;
    private String targetUrl;
}
