package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.CorporateNewsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CorporateNewsRepository extends JpaRepository<CorporateNewsEntity, UUID> {
    @Query("SELECT n FROM CorporateNewsEntity n JOIN FETCH n.company c ORDER BY n.publishedAt DESC")
    List<CorporateNewsEntity> findAllNews();

    @Query("SELECT n FROM CorporateNewsEntity n JOIN FETCH n.company c WHERE (:ticker IS NULL OR :ticker = 'ALL' OR c.ticker = :ticker) AND (:category IS NULL OR :category = 'ALL' OR n.category = :category) ORDER BY n.publishedAt DESC")
    List<CorporateNewsEntity> findByFilters(@Param("ticker") String ticker, @Param("category") String category);
}
