package com.whitequantex.market.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "market_data_sync_state")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketDataSyncStateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "provider", nullable = false, length = 64)
    private String provider;

    @Column(name = "instrument_id", length = 64)
    private String instrumentId;

    @Column(name = "symbol", nullable = false, unique = true, length = 32)
    private String symbol;

    @Column(name = "last_successful_timestamp")
    private Instant lastSuccessfulTimestamp;

    @Column(name = "last_sync_started_at")
    private Instant lastSyncStartedAt;

    @Column(name = "last_sync_completed_at")
    private Instant lastSyncCompletedAt;

    @Column(name = "next_sync_at")
    private Instant nextSyncAt;

    @Column(name = "sync_status", nullable = false, length = 32)
    @Builder.Default
    private String syncStatus = "IDLE";

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;
}
