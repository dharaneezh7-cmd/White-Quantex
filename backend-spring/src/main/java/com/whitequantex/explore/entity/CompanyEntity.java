package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyEntity {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String ticker;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String shortName;

    @Column(nullable = false, length = 150)
    @Builder.Default
    private String legalEntity = "Delaware C-Corp";

    @Column(nullable = false, unique = true, length = 50)
    private String cik;

    @Column(nullable = false, length = 100)
    private String sector;

    @Column(nullable = false, length = 150)
    private String subIndustry;

    @Column(nullable = false, length = 150)
    private String headquarters;

    @Column(nullable = false, length = 50)
    private String region;

    @Column(nullable = false)
    private Integer foundedYear;

    @Column(nullable = false, length = 150)
    private String ceo;

    @Column(nullable = false)
    @Builder.Default
    private Integer employees = 1;

    @Column(nullable = false, length = 50)
    private String valuation;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal valuationNum = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    private String annualRevenue;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal annualRevenueNum = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String verificationLevel = "PLATINUM";

    @Column(nullable = false)
    @Builder.Default
    private Integer trustScore = 90;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String logoColor = "bg-emerald-600";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "Active Trading";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String exchangeTier = "Tier-1 Institutional";

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CompanyMarketMetricEntity marketMetric;
}
