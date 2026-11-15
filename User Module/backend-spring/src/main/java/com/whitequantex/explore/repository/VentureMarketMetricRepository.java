package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.VentureMarketMetricEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VentureMarketMetricRepository extends JpaRepository<VentureMarketMetricEntity, UUID> {

    @Query("SELECT m FROM VentureMarketMetricEntity m JOIN FETCH m.venture v WHERE m.rankGainer IS NOT NULL ORDER BY m.rankGainer ASC")
    List<VentureMarketMetricEntity> findTopGainers();

    @Query("SELECT m FROM VentureMarketMetricEntity m JOIN FETCH m.venture v WHERE m.rankLoser IS NOT NULL ORDER BY m.rankLoser ASC")
    List<VentureMarketMetricEntity> findTopLosers();

    @Query("SELECT m FROM VentureMarketMetricEntity m JOIN FETCH m.venture v WHERE m.rankMostInvested IS NOT NULL ORDER BY m.rankMostInvested ASC")
    List<VentureMarketMetricEntity> findMostInvested();

    @Query("SELECT m FROM VentureMarketMetricEntity m JOIN FETCH m.venture v WHERE m.rankLeastInvested IS NOT NULL ORDER BY m.rankLeastInvested ASC")
    List<VentureMarketMetricEntity> findLeastInvested();

    @Query("SELECT m FROM VentureMarketMetricEntity m JOIN FETCH m.venture v WHERE m.rankMostActive IS NOT NULL ORDER BY m.rankMostActive ASC")
    List<VentureMarketMetricEntity> findMostActive();

    @Query("SELECT m FROM VentureMarketMetricEntity m JOIN FETCH m.venture v WHERE m.rank52wHigh IS NOT NULL ORDER BY m.rank52wHigh ASC")
    List<VentureMarketMetricEntity> find52wHighs();

    @Query("SELECT m FROM VentureMarketMetricEntity m JOIN FETCH m.venture v WHERE m.rankRecentlyViewed IS NOT NULL ORDER BY m.rankRecentlyViewed ASC")
    List<VentureMarketMetricEntity> findRecentlyViewed();

    Optional<VentureMarketMetricEntity> findByVentureId(UUID ventureId);
}
