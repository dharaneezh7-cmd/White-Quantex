package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyQuarterlyFinancialEntity;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyQuarterlyFinancialResponseDto {

    private UUID id;
    private UUID companyId;
    private String ticker;
    private String quarter;
    private Integer fiscalYear;
    private Integer quarterNumber;
    private BigDecimal revenue;
    private BigDecimal profit;
    private BigDecimal expenses;
    private BigDecimal growthRate;
    private BigDecimal profitMargin;
    private String milestones;
    private Instant reportedDate;
    private Instant createdAt;

    public static CompanyQuarterlyFinancialResponseDto fromEntity(CompanyQuarterlyFinancialEntity entity) {
        if (entity == null) return null;
        return CompanyQuarterlyFinancialResponseDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .ticker(entity.getTicker())
                .quarter(entity.getQuarter())
                .fiscalYear(entity.getFiscalYear())
                .quarterNumber(entity.getQuarterNumber())
                .revenue(entity.getRevenue())
                .profit(entity.getProfit())
                .expenses(entity.getExpenses())
                .growthRate(entity.getGrowthRate())
                .profitMargin(entity.getProfitMargin())
                .milestones(entity.getMilestones())
                .reportedDate(entity.getReportedDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
