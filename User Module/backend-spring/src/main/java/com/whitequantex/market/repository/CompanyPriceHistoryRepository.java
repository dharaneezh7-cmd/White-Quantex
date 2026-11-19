package com.whitequantex.market.repository;

import com.whitequantex.market.entity.CompanyPriceHistoryEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyPriceHistoryRepository extends JpaRepository<CompanyPriceHistoryEntity, UUID> {

    List<CompanyPriceHistoryEntity> findBySymbolIgnoreCaseAndPriceTimestampBetweenOrderByPriceTimestampAsc(
            String symbol, Instant start, Instant end
    );

    List<CompanyPriceHistoryEntity> findBySymbolIgnoreCaseOrderByPriceTimestampAsc(
            String symbol, Pageable pageable
    );

    long countBySymbolIgnoreCase(String symbol);

    void deleteBySymbolIgnoreCase(String symbol);

    @Query("SELECT h FROM CompanyPriceHistoryEntity h WHERE UPPER(h.symbol) = UPPER(:symbol) AND h.priceTimestamp >= :since ORDER BY h.priceTimestamp ASC")
    List<CompanyPriceHistoryEntity> findHistorySince(
            @Param("symbol") String symbol,
            @Param("since") Instant since
    );

    boolean existsBySymbolIgnoreCaseAndSourceAndSourceEventId(
            String symbol, String source, String sourceEventId
    );
}
