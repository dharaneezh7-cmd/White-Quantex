package com.whitequantex.market.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_price_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyPriceHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "instrument_id", nullable = false, length = 64)
    private String instrumentId;

    @Column(name = "symbol", nullable = false, length = 32)
    private String symbol;

    @Column(name = "price", nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "volume", nullable = false)
    @Builder.Default
    private Long volume = 0L;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "source", nullable = false, length = 64)
    @Builder.Default
    private String source = "INSTITUTIONAL_WQX";

    @Column(name = "source_event_id", length = 128)
    private String sourceEventId;

    @Column(name = "price_timestamp", nullable = false)
    private Instant priceTimestamp;

    @Column(name = "received_at", nullable = false)
    @Builder.Default
    private Instant receivedAt = Instant.now();

    @Column(name = "data_status", nullable = false, length = 32)
    @Builder.Default
    private String dataStatus = "HISTORICAL";

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
