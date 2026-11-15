package com.whitequantex.market.repository;

import com.whitequantex.market.entity.MarketDataSyncStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarketDataSyncStateRepository extends JpaRepository<MarketDataSyncStateEntity, UUID> {
    Optional<MarketDataSyncStateEntity> findBySymbolIgnoreCase(String symbol);
    boolean existsBySymbolIgnoreCase(String symbol);
}
