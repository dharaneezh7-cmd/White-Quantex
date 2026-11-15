package com.whitequantex.market.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "market_data_ingestion_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketDataIngestionLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "provider", nullable = false, length = 64)
    private String provider;

    @Column(name = "instrument_id", length = 64)
    private String instrumentId;

    @Column(name = "symbol", length = 32)
    private String symbol;

    @Column(name = "operation", nullable = false, length = 64)
    private String operation;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "records_received", nullable = false)
    @Builder.Default
    private Integer recordsReceived = 0;

    @Column(name = "records_accepted", nullable = false)
    @Builder.Default
    private Integer recordsAccepted = 0;

    @Column(name = "records_rejected", nullable = false)
    @Builder.Default
    private Integer recordsRejected = 0;

    @Column(name = "records_deduplicated", nullable = false)
    @Builder.Default
    private Integer recordsDeduplicated = 0;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "SUCCESS";

    @Column(name = "error_details", columnDefinition = "TEXT")
    private String errorDetails;
}
