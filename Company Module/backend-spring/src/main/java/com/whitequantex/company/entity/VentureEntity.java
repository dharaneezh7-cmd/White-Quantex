package com.whitequantex.company.entity;

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
    private BigDecimal targetRaiseNum = new BigDecimal("15000000.00");

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String raisedAmount = "$8.5M";

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal raisedAmountNum = new BigDecimal("8500000.00");

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String minInvestment = "$25,000";

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal minInvestmentNum = new BigDecimal("25000.00");

    @Column(columnDefinition = "TEXT")
    private String fundingPurpose;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String securityType = "Series A Preferred Stock";

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String lifecycleClassification = "STARTUP";

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String lifecycleStatus = "ACTIVE";

    @Column(nullable = false)
    @Builder.Default
    private Boolean graduationEligible = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isGraduated = false;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String marketListingStatus = "UNLISTED";

    @Column(columnDefinition = "TEXT")
    private String problemStatement;

    @Column(columnDefinition = "TEXT")
    private String solutionDescription;

    @Column(length = 64)
    @Builder.Default
    private String productStage = "MVP Deployed";

    @Column(name = "owner_user_id")
    private UUID ownerUserId;

    /**
     * Optimistic locking version field.
     */
    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
