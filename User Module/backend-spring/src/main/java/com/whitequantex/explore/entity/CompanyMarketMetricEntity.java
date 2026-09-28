package com.whitequantex.explore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_market_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyMarketMetricEntity {
    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;

    @Column(name = "change_24h", nullable = false, length = 20)
    @Builder.Default
    private String change24h = "0.0%";

    @Column(name = "change_percent", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal changePercent = BigDecimal.ZERO;

    @Column(name = "is_positive", nullable = false)
    @Builder.Default
    private Boolean isPositive = true;

    @Column(name = "market_cap_gain_loss", length = 50)
    private String marketCapGainLoss;

    @Column(name = "invested_today", length = 50)
    private String investedToday;

    @Column(name = "allocation_percent")
    private Integer allocationPercent;

    @Column(name = "trading_volume_today", length = 50)
    private String tradingVolumeToday;

    @Column(name = "is_52w_high", nullable = false)
    @Builder.Default
    private Boolean is52wHigh = false;

    @Column(name = "rank_gainer")
    private Integer rankGainer;

    @Column(name = "rank_loser")
    private Integer rankLoser;

    @Column(name = "rank_most_invested")
    private Integer rankMostInvested;

    @Column(name = "rank_least_invested")
    private Integer rankLeastInvested;

    @Column(name = "rank_most_active")
    private Integer rankMostActive;

    @Column(name = "rank_52w_high")
    private Integer rank52wHigh;

    @Column(name = "rank_recently_viewed")
    private Integer rankRecentlyViewed;

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
