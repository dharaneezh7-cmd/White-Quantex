package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_quarterly_financials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyQuarterlyFinancialEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID companyId;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(nullable = false, length = 20)
    private String quarter; // e.g. "Q1 2026", "Q2 2026"

    @Column(nullable = false)
    private Integer fiscalYear;

    @Column(nullable = false)
    private Integer quarterNumber;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal profit = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal expenses = BigDecimal.ZERO;

    @Column(precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal growthRate = BigDecimal.ZERO;

    @Column(precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal profitMargin = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String milestones;

    @Builder.Default
    private Instant reportedDate = Instant.now();

    @Builder.Default
    private Instant createdAt = Instant.now();
}
