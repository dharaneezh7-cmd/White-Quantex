package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.CompanyEntity;
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
public interface CompanyRepository extends JpaRepository<CompanyEntity, UUID> {
    Optional<CompanyEntity> findByTickerIgnoreCase(String ticker);
    Optional<CompanyEntity> findByCikIgnoreCase(String cik);

    List<CompanyEntity> findByIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT c FROM CompanyEntity c WHERE c.isActive = true AND " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.ticker) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.sector) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.subIndustry) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.ceo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.headquarters) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.legalEntity) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.cik) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:sector IS NULL OR :sector = 'All' OR c.sector = :sector) AND " +
           "(:tier IS NULL OR :tier = 'All' OR c.exchangeTier = :tier OR c.status = :tier) AND " +
           "(:minValuation IS NULL OR c.valuationNum >= :minValuation) AND " +
           "(:maxValuation IS NULL OR c.valuationNum <= :maxValuation) AND " +
           "(:letter IS NULL OR :letter = 'ALL' OR UPPER(c.name) LIKE CONCAT(UPPER(:letter), '%'))")
    Page<CompanyEntity> searchCompanies(
            @Param("query") String query,
            @Param("sector") String sector,
            @Param("tier") String tier,
            @Param("minValuation") BigDecimal minValuation,
            @Param("maxValuation") BigDecimal maxValuation,
            @Param("letter") String letter,
            Pageable pageable);
}
