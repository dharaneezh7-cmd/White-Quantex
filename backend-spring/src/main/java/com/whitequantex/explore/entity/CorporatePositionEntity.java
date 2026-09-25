package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "corporate_positions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorporatePositionEntity {
    @Id
    private UUID id;

    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;

    @Column(nullable = false)
    @Builder.Default
    private Long shares = 0L;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String shareClass = "Class A Common Stock";

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal costBasis = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal currentValue = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal unrealizedPl = BigDecimal.ZERO;

    @Column(nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal unrealizedPlPercent = BigDecimal.ZERO;

    @Column(nullable = false, precision = 6, scale = 3)
    @Builder.Default
    private BigDecimal ownershipPercent = BigDecimal.ZERO;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
