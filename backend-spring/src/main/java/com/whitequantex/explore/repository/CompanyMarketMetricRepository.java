package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.CompanyMarketMetricEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyMarketMetricRepository extends JpaRepository<CompanyMarketMetricEntity, UUID> {

    @Query("SELECT m FROM CompanyMarketMetricEntity m JOIN FETCH m.company c WHERE m.rankGainer IS NOT NULL ORDER BY m.rankGainer ASC")
    List<CompanyMarketMetricEntity> findTopGainers();

    @Query("SELECT m FROM CompanyMarketMetricEntity m JOIN FETCH m.company c WHERE m.rankLoser IS NOT NULL ORDER BY m.rankLoser ASC")
    List<CompanyMarketMetricEntity> findTopLosers();

    @Query("SELECT m FROM CompanyMarketMetricEntity m JOIN FETCH m.company c WHERE m.rankMostInvested IS NOT NULL ORDER BY m.rankMostInvested ASC")
    List<CompanyMarketMetricEntity> findMostInvested();

    @Query("SELECT m FROM CompanyMarketMetricEntity m JOIN FETCH m.company c WHERE m.rankLeastInvested IS NOT NULL ORDER BY m.rankLeastInvested ASC")
    List<CompanyMarketMetricEntity> findLeastInvested();

    @Query("SELECT m FROM CompanyMarketMetricEntity m JOIN FETCH m.company c WHERE m.rankMostActive IS NOT NULL ORDER BY m.rankMostActive ASC")
    List<CompanyMarketMetricEntity> findMostActive();

    @Query("SELECT m FROM CompanyMarketMetricEntity m JOIN FETCH m.company c WHERE m.rank52wHigh IS NOT NULL ORDER BY m.rank52wHigh ASC")
    List<CompanyMarketMetricEntity> find52wHighs();

    @Query("SELECT m FROM CompanyMarketMetricEntity m JOIN FETCH m.company c WHERE m.rankRecentlyViewed IS NOT NULL ORDER BY m.rankRecentlyViewed ASC")
    List<CompanyMarketMetricEntity> findRecentlyViewed();

    java.util.Optional<CompanyMarketMetricEntity> findByCompanyId(UUID companyId);
}
