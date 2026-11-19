package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.VentureEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VentureRepository extends JpaRepository<VentureEntity, UUID> {
    Optional<VentureEntity> findByTickerIgnoreCase(String ticker);
    Optional<VentureEntity> findByNameIgnoreCase(String name);
    Optional<VentureEntity> findByCikIgnoreCase(String cik);

    List<VentureEntity> findByIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT SUM(v.valuationNum) FROM VentureEntity v WHERE v.isActive = true")
    BigDecimal sumTotalValuation();

    @Query("SELECT AVG(v.trustScore) FROM VentureEntity v WHERE v.isActive = true")
    Double averageTrustScore();

    @Query("SELECT COUNT(v) FROM VentureEntity v WHERE v.isActive = true AND (LOWER(v.legalEntity) LIKE '%c-corp%' OR LOWER(v.legalEntity) LIKE '%inc%')")
    Long countCCorps();

    @Query("SELECT v FROM VentureEntity v WHERE v.isActive = true AND " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.ticker) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.sector) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.subIndustry) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.ceo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.headquarters) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.legalEntity) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.roundType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.cik) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:sector IS NULL OR :sector = 'All' OR v.sector = :sector) AND " +
           "(:tier IS NULL OR :tier = 'All' OR v.exchangeTier = :tier OR v.status = :tier OR v.roundType = :tier) AND " +
           "(:minValuation IS NULL OR v.valuationNum >= :minValuation) AND " +
           "(:maxValuation IS NULL OR v.valuationNum <= :maxValuation) AND " +
           "(:letter IS NULL OR :letter = 'ALL' OR UPPER(v.name) LIKE CONCAT(UPPER(:letter), '%'))")
    Page<VentureEntity> searchVentures(
            @Param("query") String query,
            @Param("sector") String sector,
            @Param("tier") String tier,
            @Param("minValuation") BigDecimal minValuation,
            @Param("maxValuation") BigDecimal maxValuation,
            @Param("letter") String letter,
            Pageable pageable);
}
