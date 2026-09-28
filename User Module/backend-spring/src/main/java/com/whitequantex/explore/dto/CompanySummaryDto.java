package com.whitequantex.explore.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySummaryDto {
    private UUID id;
    private String ticker;
    private String name;
    private String shortName;
    private String legalEntity;
    private String cik;
    private String sector;
    private String subIndustry;
    private String headquarters;
    private String region;
    private Integer foundedYear;
    private String ceo;
    private Integer employees;
    private String valuation;
    private BigDecimal valuationNum;
    private String annualRevenue;
    private BigDecimal annualRevenueNum;
    private String verificationLevel;
    private Integer trustScore;
    private String description;
    private String logoColor;
    private String status;
    private String exchangeTier;

    // Associated market metrics (if present)
    private String change24h;
    private BigDecimal changePercent;
    private Boolean isPositive;
    private String marketCapGainLoss;
    private String investedToday;
    private Integer allocationPercent;
    private String tradingVolumeToday;
}
