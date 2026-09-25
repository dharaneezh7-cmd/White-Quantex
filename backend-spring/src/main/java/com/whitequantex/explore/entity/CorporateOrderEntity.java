package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "corporate_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorporateOrderEntity {
    @Id
    private UUID id;

    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String type = "BUY";

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String shareClass = "Class A Common Stock";

    @Column(nullable = false)
    private Long shares;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerShare;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "FILLED";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String settlementStatus = "SETTLED";

    @Builder.Default
    private Instant executedAt = Instant.now();

    @Builder.Default
    private Instant createdAt = Instant.now();
}
