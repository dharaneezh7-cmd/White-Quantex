package com.whitequantex.market.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_price_current")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyPriceCurrentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "instrument_id", nullable = false, length = 64)
    private String instrumentId;

    @Column(name = "symbol", nullable = false, unique = true, length = 32)
    private String symbol;

    @Column(name = "latest_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal latestPrice;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "price_timestamp", nullable = false)
    private Instant priceTimestamp;

    @Column(name = "provider", nullable = false, length = 64)
    @Builder.Default
    private String provider = "INSTITUTIONAL_WQX";

    @Column(name = "data_status", nullable = false, length = 32)
    @Builder.Default
    private String dataStatus = "LIVE";

    @Column(name = "market_status", nullable = false, length = 32)
    @Builder.Default
    private String marketStatus = "OPEN";

    @Column(name = "day_open", precision = 19, scale = 4)
    private BigDecimal dayOpen;

    @Column(name = "day_high", precision = 19, scale = 4)
    private BigDecimal dayHigh;

    @Column(name = "day_low", precision = 19, scale = 4)
    private BigDecimal dayLow;

    @Column(name = "prev_close", precision = 19, scale = 4)
    private BigDecimal prevClose;

    @Column(name = "change_amount", precision = 19, scale = 4)
    private BigDecimal changeAmount;

    @Column(name = "change_percent", precision = 9, scale = 4)
    private BigDecimal changePercent;

    @Column(name = "volume_shares", nullable = false)
    @Builder.Default
    private Long volumeShares = 0L;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
