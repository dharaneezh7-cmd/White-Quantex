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
public class HoldingsSummaryDto {
    private BigDecimal totalValue;
    private BigDecimal totalCostBasis;
    private BigDecimal totalUnrealizedPl;
    private BigDecimal totalUnrealizedPlPercent;
    private BigDecimal dayChangeAmount;
    private BigDecimal dayChangePercent;
    private BigDecimal monthChangeAmount;
    private BigDecimal monthChangePercent;

    private BigDecimal companiesValue;
    private Integer companiesCount;
    private BigDecimal companiesPl;
    private BigDecimal companiesPlPercent;
    private BigDecimal companiesDayPl;
    private BigDecimal companiesMonthPl;

    private BigDecimal venturesValue;
    private Integer venturesCount;
    private BigDecimal venturesPl;
    private BigDecimal venturesPlPercent;
    private BigDecimal venturesDayPl;
    private BigDecimal venturesMonthPl;

    private BigDecimal stocksValue;
    private Integer stocksCount;
    private BigDecimal stocksPl;
    private BigDecimal stocksPlPercent;
    private BigDecimal stocksDayPl;
    private BigDecimal stocksMonthPl;
}
