package com.whitequantex.explore.repository;

import com.whitequantex.explore.entity.WqRecommendationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WqRecommendationRepository extends JpaRepository<WqRecommendationEntity, UUID> {
    List<WqRecommendationEntity> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<WqRecommendationEntity> findByTickerIgnoreCase(String ticker);
}
