package com.whitequantex.market.repository;

import com.whitequantex.market.entity.MarketDataIngestionLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketDataIngestionLogRepository extends JpaRepository<MarketDataIngestionLogEntity, UUID> {
    List<MarketDataIngestionLogEntity> findTop50ByOrderByStartedAtDesc();
}
