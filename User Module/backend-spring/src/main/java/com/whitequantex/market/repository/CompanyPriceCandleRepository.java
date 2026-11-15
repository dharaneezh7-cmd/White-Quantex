package com.whitequantex.market.repository;

import com.whitequantex.market.entity.CompanyPriceCandleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyPriceCandleRepository extends JpaRepository<CompanyPriceCandleEntity, UUID> {

    List<CompanyPriceCandleEntity> findBySymbolIgnoreCaseAndCandleIntervalAndCandleStartBetweenOrderByCandleStartAsc(
            String symbol, String candleInterval, Instant start, Instant end
    );

    List<CompanyPriceCandleEntity> findBySymbolIgnoreCaseAndCandleIntervalOrderByCandleStartAsc(
            String symbol, String candleInterval
    );

    Optional<CompanyPriceCandleEntity> findBySymbolIgnoreCaseAndCandleIntervalAndCandleStart(
            String symbol, String candleInterval, Instant candleStart
    );

    long countBySymbolIgnoreCaseAndCandleInterval(String symbol, String candleInterval);
}
