package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ventures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentureEntity {
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
    private String verificationLevel = "GOLD";

    @Column(nullable = false)
    @Builder.Default
    private Integer trustScore = 85;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String logoColor = "bg-indigo-600";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "Active Trading";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String exchangeTier = "Venture Growth Tier";

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String roundType = "Series A";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String targetRaise = "$15.0M";

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal targetRaiseNum = BigDecimal.valueOf(15000000);

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String raisedAmount = "$8.5M";

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal raisedAmountNum = BigDecimal.valueOf(8500000);

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String minInvestment = "$25,000";

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal minInvestmentNum = BigDecimal.valueOf(25000);

    @Column(columnDefinition = "TEXT")
    private String fundingPurpose;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String securityType = "Series A Preferred Stock";

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @OneToOne(mappedBy = "venture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private VentureMarketMetricEntity marketMetric;
}
