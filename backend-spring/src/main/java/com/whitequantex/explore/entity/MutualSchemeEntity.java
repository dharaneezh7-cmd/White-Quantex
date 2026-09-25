package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mutual_investment_schemes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MutualSchemeEntity {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String strategy;

    @Column(nullable = false, length = 50)
    private String nav;

    @Column(nullable = false, length = 50)
    private String oneYearReturn;

    @Column(nullable = false, length = 50)
    private String minInvestment;

    @Column(nullable = false, length = 50)
    private String aum;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String riskLevel = "Moderate";

    @Column(nullable = false, length = 150)
    private String manager;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String topHoldings;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 150)
    private String benchmark;

    @Column(nullable = false, length = 50)
    private String expenseRatio;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
