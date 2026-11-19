package com.whitequantex.company.dto;

import com.whitequantex.company.entity.CompanyEntity;
import com.whitequantex.company.entity.VentureEntity;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponseDto {

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
    private BigDecimal quarterlyRevenue;
    private BigDecimal quarterlyProfit;
    private Instant lastFinancialUpdate;
    private String verificationLevel;
    private Integer trustScore;
    private String description;
    private String logoColor;
    private String status;
    private String exchangeTier;
    private Boolean isActive;
    private String lifecycleClassification;
    private String lifecycleStatus;
    private Instant graduationDate;
    private String marketListingStatus;
    private UUID ownerUserId;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;

    public static CompanyResponseDto fromEntity(CompanyEntity entity) {
        if (entity == null) return null;
        return CompanyResponseDto.builder()
                .id(entity.getId())
                .ticker(entity.getTicker())
                .name(entity.getName())
                .shortName(entity.getShortName())
                .legalEntity(entity.getLegalEntity())
                .cik(entity.getCik())
                .sector(entity.getSector())
                .subIndustry(entity.getSubIndustry())
                .headquarters(entity.getHeadquarters())
                .region(entity.getRegion())
                .foundedYear(entity.getFoundedYear())
                .ceo(entity.getCeo())
                .employees(entity.getEmployees())
                .valuation(entity.getValuation())
                .valuationNum(entity.getValuationNum())
                .annualRevenue(entity.getAnnualRevenue())
                .annualRevenueNum(entity.getAnnualRevenueNum())
                .quarterlyRevenue(entity.getQuarterlyRevenue())
                .quarterlyProfit(entity.getQuarterlyProfit())
                .lastFinancialUpdate(entity.getLastFinancialUpdate())
                .verificationLevel(entity.getVerificationLevel())
                .trustScore(entity.getTrustScore())
                .description(entity.getDescription())
                .logoColor(entity.getLogoColor())
                .status(entity.getStatus())
                .exchangeTier(entity.getExchangeTier())
                .isActive(entity.getIsActive())
                .lifecycleClassification(entity.getLifecycleClassification())
                .lifecycleStatus(entity.getLifecycleStatus())
                .graduationDate(entity.getGraduationDate())
                .marketListingStatus(entity.getMarketListingStatus())
                .ownerUserId(entity.getOwnerUserId())
                .version(entity.getVersion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static CompanyResponseDto fromVenture(VentureEntity venture) {
        if (venture == null) return null;
        return CompanyResponseDto.builder()
                .id(venture.getId())
                .ticker(venture.getTicker())
                .name(venture.getName())
                .shortName(venture.getShortName())
                .legalEntity(venture.getLegalEntity())
                .cik(venture.getCik())
                .sector(venture.getSector())
                .subIndustry(venture.getSubIndustry())
                .headquarters(venture.getHeadquarters())
                .region(venture.getRegion())
                .foundedYear(venture.getFoundedYear())
                .ceo(venture.getCeo())
                .employees(venture.getEmployees())
                .valuation(venture.getValuation())
                .valuationNum(venture.getValuationNum())
                .annualRevenue(venture.getAnnualRevenue())
                .annualRevenueNum(venture.getAnnualRevenueNum())
                .verificationLevel(venture.getVerificationLevel())
                .trustScore(venture.getTrustScore())
                .description(venture.getDescription())
                .logoColor(venture.getLogoColor())
                .status(venture.getStatus())
                .exchangeTier(venture.getExchangeTier())
                .isActive(venture.getIsActive())
                .lifecycleClassification(venture.getLifecycleClassification())
                .lifecycleStatus(venture.getLifecycleStatus())
                .marketListingStatus(venture.getMarketListingStatus())
                .ownerUserId(venture.getOwnerUserId())
                .version(venture.getVersion())
                .createdAt(venture.getCreatedAt())
                .updatedAt(venture.getUpdatedAt())
                .build();
    }
}
